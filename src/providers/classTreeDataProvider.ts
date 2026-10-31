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

  private watchers: vscode.FileSystemWatcher[] = [];

  constructor() {
    this.setupWatcher();
  }

  public refresh(): void {
    JavapRunner.clearCache();
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
    const items: BytecodeTreeItem[] = [];
    const foundDirs = new Set<string>();

    for (const folder of vscode.workspace.workspaceFolders || []) {
      const classUris = await vscode.workspace.findFiles(
        new vscode.RelativePattern(folder, '**/*.class'),
        '**/node_modules/**',
        500
      );

      for (const uri of classUris) {
        const rootDir = this.extractOutputRoot(uri.fsPath, folder.uri.fsPath);
        if (rootDir && !foundDirs.has(rootDir)) {
          foundDirs.add(rootDir);
          let relativeLabel = path.relative(folder.uri.fsPath, rootDir).replace(/\\/g, '/');
          if (!relativeLabel || relativeLabel === '.') {
            relativeLabel = path.basename(folder.uri.fsPath);
          }

          items.push(
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

      // Fallback if no known output pattern matched
      if (items.length === 0 && classUris.length > 0) {
        items.push(
          new BytecodeTreeItem(
            path.basename(folder.uri.fsPath) + ' (classes)',
            vscode.TreeItemCollapsibleState.Expanded,
            TreeItemType.RootDirectory,
            folder.uri.fsPath,
            folder.uri.fsPath
          )
        );
      }
    }

    // Sort roots alphabetically
    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
  }

  private extractOutputRoot(classFilePath: string, workspacePath: string): string | null {
    const normalizedClass = path.normalize(classFilePath);

    const patterns = [
      path.join('target', 'classes'),
      path.join('target', 'test-classes'),
      path.join('build', 'classes', 'java', 'main'),
      path.join('build', 'classes', 'java', 'test'),
      path.join('build', 'classes', 'kotlin', 'main'),
      path.join('bin')
    ];

    for (const pat of patterns) {
      const idx = normalizedClass.lastIndexOf(pat);
      if (idx !== -1) {
        return normalizedClass.slice(0, idx + pat.length);
      }
    }

    return null;
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
          if (this.containsClassFiles(full)) {
            const { chainedLabel, chainedPath } = this.compactPackagePath(full, entry.name);
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

  private containsClassFiles(dir: string): boolean {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.endsWith('.class')) {
          return true;
        }
        if (entry.isDirectory() && this.containsClassFiles(path.join(dir, entry.name))) {
          return true;
        }
      }
    } catch {
      return false;
    }
    return false;
  }

  private compactPackagePath(currentDir: string, currentLabel: string): { chainedLabel: string; chainedPath: string } {
    let nextDir = currentDir;
    let combinedLabel = currentLabel;

    while (true) {
      try {
        const entries = fs.readdirSync(nextDir, { withFileTypes: true });
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
