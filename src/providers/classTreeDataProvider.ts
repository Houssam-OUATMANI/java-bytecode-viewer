import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BytecodeDocumentProvider } from './bytecodeDocumentProvider';
import { JavapRunner } from '../disassembler/javapRunner';

export enum TreeItemType {
  RootDirectory = 'rootDirectory',
  Package = 'package',
  ClassFile = 'classFile',
  InnerClassFile = 'innerClassFile'
}

export class BytecodeTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: TreeItemType,
    public readonly fullPath: string,
    public readonly rootPath?: string,
    public readonly innerClassFiles: string[] = []
  ) {
    super(label, collapsibleState);

    this.contextValue = itemType;

    if (itemType === TreeItemType.RootDirectory) {
      this.iconPath = new vscode.ThemeIcon('folder-library');
      this.tooltip = fullPath;
    } else if (itemType === TreeItemType.Package) {
      this.iconPath = new vscode.ThemeIcon('package');
      this.tooltip = label;
    } else if (itemType === TreeItemType.ClassFile) {
      this.iconPath = new vscode.ThemeIcon('file-code');
      this.tooltip = fullPath;
      this.resourceUri = vscode.Uri.file(fullPath);
      this.command = {
        command: 'javaBytecode.openClassBytecode',
        title: 'Open Bytecode',
        arguments: [fullPath]
      };
      if (innerClassFiles.length > 0) {
        this.description = `+${innerClassFiles.length} inner`;
      }
    } else if (itemType === TreeItemType.InnerClassFile) {
      this.iconPath = new vscode.ThemeIcon('symbol-class');
      this.tooltip = fullPath;
      this.resourceUri = vscode.Uri.file(fullPath);
      this.command = {
        command: 'javaBytecode.openClassBytecode',
        title: 'Open Bytecode',
        arguments: [fullPath]
      };
    }
  }
}

export class ClassTreeDataProvider implements vscode.TreeDataProvider<BytecodeTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<BytecodeTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private watchers: vscode.Disposable[] = [];
  private rootDirectoriesCache: BytecodeTreeItem[] | undefined;
  private classFilePresenceCache = new Map<string, Promise<boolean>>();

  constructor() {
    this.setupWatcher();
  }

  public refresh(): void {
    JavapRunner.clearCache();
    this.rootDirectoriesCache = undefined;
    this.classFilePresenceCache.clear();
    this._onDidChangeTreeData.fire();
  }

  public dispose(): void {
    this.watchers.forEach((w) => w.dispose());
  }

  private setupWatcher(): void {
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.class');
    watcher.onDidCreate(() => this.refresh());
    watcher.onDidDelete(() => this.refresh());
    watcher.onDidChange((uri) => {
      JavapRunner.clearCache(uri.fsPath);
      const bytecodeUri = BytecodeDocumentProvider.getUriForClassFile(uri.fsPath);
      vscode.commands.executeCommand('javaBytecode.notifyClassChanged', bytecodeUri);
    });
    this.watchers.push(watcher);
    this.watchers.push(
      vscode.workspace.onDidChangeWorkspaceFolders(() => this.refresh()),
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration('javaBytecode.outputDirectories')) {
          this.refresh();
        }
      })
    );
  }

  public getTreeItem(element: BytecodeTreeItem): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: BytecodeTreeItem): Promise<BytecodeTreeItem[]> {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
      return [];
    }

    if (!element) {
      return this.getRootDirectories();
    }

    if (element.itemType === TreeItemType.RootDirectory || element.itemType === TreeItemType.Package) {
      return this.getPackagesOrClassesInDir(element.fullPath, element.rootPath || element.fullPath);
    }

    if (element.itemType === TreeItemType.ClassFile && element.innerClassFiles.length > 0) {
      // Return inner classes under this class
      return element.innerClassFiles.map((innerPath) => {
        const innerName = path.basename(innerPath);
        // Format friendly name: App$Builder -> $Builder or App$1 -> $1 (anonymous)
        const parentBase = path.basename(element.fullPath, '.class');
        let shortLabel = innerName;
        if (innerName.startsWith(parentBase + '$')) {
          shortLabel = '$' + innerName.slice(parentBase.length + 1);
        }

        return new BytecodeTreeItem(
          shortLabel,
          vscode.TreeItemCollapsibleState.None,
          TreeItemType.InnerClassFile,
          innerPath,
          element.rootPath
        );
      });
    }

    return [];
  }

  private async getRootDirectories(): Promise<BytecodeTreeItem[]> {
    if (this.rootDirectoriesCache) {
      return this.rootDirectoriesCache;
    }

    const items: BytecodeTreeItem[] = [];
    const foundDirs = new Set<string>();
    const configuredOutputDirectories: unknown = vscode.workspace
      .getConfiguration('javaBytecode')
      .get('outputDirectories', [
        '**/target/classes',
        '**/target/test-classes',
        '**/build/classes/java/main',
        '**/build/classes/java/test',
        '**/build/classes/kotlin/main',
        '**/bin'
      ]);
    const outputDirectories = Array.isArray(configuredOutputDirectories)
      ? configuredOutputDirectories.filter(
          (directory): directory is string => typeof directory === 'string' && directory.trim() !== ''
        )
      : [];

    for (const folder of vscode.workspace.workspaceFolders || []) {
      const searches = await Promise.all(
        outputDirectories.map((directory) => {
          const normalizedDirectory = directory.replace(/\\/g, '/').replace(/\/+$/, '');
          return vscode.workspace.findFiles(
            new vscode.RelativePattern(folder, `${normalizedDirectory}/**/*.class`),
            '**/node_modules/**'
          );
        })
      );
      const classUris = [...new Map(searches.flat().map((uri) => [uri.fsPath, uri])).values()];
      const folderItems: BytecodeTreeItem[] = [];

      for (const uri of classUris) {
        const rootDir = this.extractOutputRoot(uri.fsPath, folder.uri.fsPath, outputDirectories);
        if (rootDir && !foundDirs.has(rootDir)) {
          foundDirs.add(rootDir);
          let relativeLabel = path.relative(folder.uri.fsPath, rootDir).replace(/\\/g, '/');
          if (!relativeLabel || relativeLabel === '.') {
            relativeLabel = path.basename(folder.uri.fsPath);
          }

          folderItems.push(
            new BytecodeTreeItem(
              relativeLabel,
              vscode.TreeItemCollapsibleState.Expanded,
              TreeItemType.RootDirectory,
              rootDir,
              rootDir
            )
          );
        }
      }

      if (folderItems.length === 0 && classUris.length > 0) {
        folderItems.push(
          new BytecodeTreeItem(
            path.basename(folder.uri.fsPath) + ' (classes)',
            vscode.TreeItemCollapsibleState.Expanded,
            TreeItemType.RootDirectory,
            folder.uri.fsPath,
            folder.uri.fsPath
          )
        );
      }
      items.push(...folderItems);
    }

    // Sort roots alphabetically
    items.sort((a, b) => a.label.localeCompare(b.label));
    this.rootDirectoriesCache = items;
    return items;
  }

  private extractOutputRoot(classFilePath: string, workspacePath: string, outputDirectories: string[]): string | null {
    const relativeClassPath = path.relative(workspacePath, classFilePath).replace(/\\/g, '/');
    const directorySegments = relativeClassPath.split('/');
    let bestRoot: string | null = null;
    let bestDepth = -1;
    const matchers = outputDirectories.map((directory) => this.globToRegExp(directory));

    for (const matcher of matchers) {
      for (let i = 1; i < directorySegments.length; i++) {
        const relativeDirectory = directorySegments.slice(0, i).join('/');
        if (matcher.test(relativeDirectory) && i > bestDepth) {
          bestRoot = path.join(workspacePath, ...directorySegments.slice(0, i));
          bestDepth = i;
        }
      }
    }

    return bestRoot;
  }

  private globToRegExp(glob: string): RegExp {
    const normalized = glob.replace(/\\/g, '/').replace(/\/+$/, '').replace(/^\.\//, '');
    const toExpression = (pattern: string): string => {
      let expression = '';

      for (let i = 0; i < pattern.length; i++) {
        const character = pattern[i];
        if (character === '*' && pattern[i + 1] === '*') {
          if (pattern[i + 2] === '/') {
            expression += '(?:.*/)?';
            i += 2;
          } else {
            expression += '.*';
            i++;
          }
        } else if (character === '*') {
          expression += '[^/]*';
        } else if (character === '?') {
          expression += '[^/]';
        } else if (character === '{') {
          let depth = 1;
          let end = i + 1;
          for (; end < pattern.length && depth > 0; end++) {
            if (pattern[end] === '{') {
              depth++;
            } else if (pattern[end] === '}') {
              depth--;
            }
          }

          if (depth === 0) {
            const alternatives: string[] = [];
            let start = i + 1;
            let nestedDepth = 0;
            for (let j = start; j < end - 1; j++) {
              if (pattern[j] === '{') {
                nestedDepth++;
              } else if (pattern[j] === '}') {
                nestedDepth--;
              } else if (pattern[j] === ',' && nestedDepth === 0) {
                alternatives.push(pattern.slice(start, j));
                start = j + 1;
              }
            }
            alternatives.push(pattern.slice(start, end - 1));
            expression += `(?:${alternatives.map(toExpression).join('|')})`;
            i = end - 1;
          } else {
            expression += '\\{';
          }
        } else if (character === '[') {
          const end = pattern.indexOf(']', i + 1);
          if (end !== -1) {
            const characterClass = pattern.slice(i + 1, end).replace(/^!/, '^');
            expression += `[${characterClass}]`;
            i = end;
          } else {
            expression += '\\[';
          }
        } else {
          expression += character.replace(/[|\\}()[\]^$+?.]/g, '\\$&');
        }
      }

      return expression;
    };

    return new RegExp(`^${toExpression(normalized)}$`);
  }

  private async getPackagesOrClassesInDir(dirPath: string, rootPath: string): Promise<BytecodeTreeItem[]> {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const dirs: BytecodeTreeItem[] = [];
      const classFileMap = new Map<string, { fullPath: string; innerFiles: string[] }>();

      for (const entry of entries) {
        const full = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          if (await this.containsClassFiles(full)) {
            const { chainedLabel, chainedPath } = await this.compactPackagePath(full, entry.name);
            dirs.push(
              new BytecodeTreeItem(
                chainedLabel,
                vscode.TreeItemCollapsibleState.Collapsed,
                TreeItemType.Package,
                chainedPath,
                rootPath
              )
            );
          }
        } else if (entry.isFile() && entry.name.endsWith('.class')) {
          const fileName = entry.name;
          const dollarIdx = fileName.indexOf('$');

          if (dollarIdx !== -1) {
            // It's an inner class (e.g. App$Builder.class or App$1.class)
            const outerName = fileName.slice(0, dollarIdx) + '.class';
            const existing = classFileMap.get(outerName);
            if (existing) {
              existing.innerFiles.push(full);
            } else {
              // Might encounter inner class before outer class
              classFileMap.set(outerName, {
                fullPath: path.join(dirPath, outerName),
                innerFiles: [full]
              });
            }
          } else {
            // Main outer class
            const existing = classFileMap.get(fileName);
            if (existing) {
              existing.fullPath = full;
            } else {
              classFileMap.set(fileName, {
                fullPath: full,
                innerFiles: []
              });
            }
          }
        }
      }

      const files: BytecodeTreeItem[] = [];

      for (const [className, data] of classFileMap.entries()) {
        const exists = fs.existsSync(data.fullPath);
        if (exists) {
          const hasInners = data.innerFiles.length > 0;
          files.push(
            new BytecodeTreeItem(
              className,
              hasInners ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
              TreeItemType.ClassFile,
              data.fullPath,
              rootPath,
              data.innerFiles
            )
          );
        } else {
          // If the outer class doesn't exist for some reason, list each inner class directly
          for (const inner of data.innerFiles) {
            files.push(
              new BytecodeTreeItem(
                path.basename(inner),
                vscode.TreeItemCollapsibleState.None,
                TreeItemType.ClassFile,
                inner,
                rootPath
              )
            );
          }
        }
      }

      dirs.sort((a, b) => a.label.localeCompare(b.label));
      files.sort((a, b) => a.label.localeCompare(b.label));

      return [...dirs, ...files];
    } catch {
      return [];
    }
  }

  private containsClassFiles(dir: string): Promise<boolean> {
    const cached = this.classFilePresenceCache.get(dir);
    if (cached) {
      return cached;
    }

    const result = (async () => {
      try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isFile() && entry.name.endsWith('.class')) {
            return true;
          }
          if (entry.isDirectory() && await this.containsClassFiles(path.join(dir, entry.name))) {
            return true;
          }
        }
      } catch {
        return false;
      }
      return false;
    })();

    this.classFilePresenceCache.set(dir, result);
    return result;
  }

  private async compactPackagePath(
    currentDir: string,
    currentLabel: string
  ): Promise<{ chainedLabel: string; chainedPath: string }> {
    let nextDir = currentDir;
    let combinedLabel = currentLabel;

    while (true) {
      try {
        const entries = await fs.promises.readdir(nextDir, { withFileTypes: true });
        const subdirs = entries.filter((e) => e.isDirectory());
        const hasFiles = entries.some((e) => e.isFile());

        if (!hasFiles && subdirs.length === 1) {
          combinedLabel += '.' + subdirs[0].name;
          nextDir = path.join(nextDir, subdirs[0].name);
        } else {
          break;
        }
      } catch {
        break;
      }
    }

    return { chainedLabel: combinedLabel, chainedPath: nextDir };
  }
}
