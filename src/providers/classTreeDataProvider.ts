import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { BytecodeDocumentProvider } from './bytecodeDocumentProvider';

export enum TreeItemType {
  RootDirectory = 'rootDirectory',
  Package = 'package',
  ClassFile = 'classFile'
}

export class BytecodeTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly itemType: TreeItemType,
    public readonly fullPath: string,
    public readonly rootPath?: string
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
      // If a class file changed, refresh tree and the open virtual document
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
      // Top level: Find all class output directories
      return this.getRootDirectories();
    }

    if (element.itemType === TreeItemType.RootDirectory) {
      // List packages inside this root directory
      return this.getPackagesOrClassesInDir(element.fullPath, element.fullPath);
    }

    if (element.itemType === TreeItemType.Package) {
      // List sub-packages or class files
      return this.getPackagesOrClassesInDir(element.fullPath, element.rootPath || element.fullPath);
    }

    return [];
  }

  private async getRootDirectories(): Promise<BytecodeTreeItem[]> {
    const config = vscode.workspace.getConfiguration('javaBytecode');
    const configuredPatterns = config.get<string[]>('outputDirectories', [
      '**/target/classes',
      '**/target/test-classes',
      '**/build/classes/java/main',
      '**/build/classes/java/test',
      '**/bin'
    ]);

    const items: BytecodeTreeItem[] = [];
    const foundDirs = new Set<string>();

    for (const folder of vscode.workspace.workspaceFolders || []) {
      for (const pattern of configuredPatterns) {
        // Find matching folders
        const relativePattern = new vscode.RelativePattern(folder, pattern);
        const matches = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, `${pattern}/**/*.class`), null, 1);
        if (matches.length > 0) {
          // Identify the base directory
          // Find root directory matching the pattern
          const sample = matches[0].fsPath;
          const rootMatch = this.extractOutputRoot(sample, folder.uri.fsPath);
          if (rootMatch && !foundDirs.has(rootMatch)) {
            foundDirs.add(rootMatch);
            const relativeName = path.relative(folder.uri.fsPath, rootMatch).replace(/\\/g, '/');
            items.push(
              new BytecodeTreeItem(
                relativeName || path.basename(rootMatch),
                vscode.TreeItemCollapsibleState.Expanded,
                TreeItemType.RootDirectory,
                rootMatch,
                rootMatch
              )
            );
          }
        }
      }

      // If no standard folder matched, but .class files exist anywhere in workspace:
      if (items.length === 0) {
        const allClasses = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, '**/*.class'), '**/node_modules/**', 10);
        if (allClasses.length > 0) {
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
    }

    return items;
  }

  private extractOutputRoot(classFilePath: string, workspacePath: string): string | null {
    const normalizedClass = path.normalize(classFilePath);
    const normalizedWs = path.normalize(workspacePath);

    const patterns = [
      path.join('target', 'classes'),
      path.join('target', 'test-classes'),
      path.join('build', 'classes', 'java', 'main'),
      path.join('build', 'classes', 'java', 'test'),
      path.join('build', 'classes', 'kotlin', 'main'),
      path.join('bin')
    ];

    for (const pat of patterns) {
      const idx = normalizedClass.indexOf(pat);
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
      const files: BytecodeTreeItem[] = [];

      for (const entry of entries) {
        const full = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // Check if directory contains .class files recursively
          if (this.containsClassFiles(full)) {
            // Check for compact package chains (e.g. com/example/app => com.example.app)
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
          files.push(
            new BytecodeTreeItem(
              entry.name,
              vscode.TreeItemCollapsibleState.None,
              TreeItemType.ClassFile,
              full,
              rootPath
            )
          );
        }
      }

      // Sort: folders/packages first, then files alphabetically
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

  /**
   * Compacts empty intermediate packages like IntelliJ (e.g. com -> com.example.myproject)
   */
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

