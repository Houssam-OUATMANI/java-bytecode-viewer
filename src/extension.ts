import * as vscode from 'vscode';
import { BytecodeDocumentProvider } from './providers/bytecodeDocumentProvider';
import { ClassTreeDataProvider } from './providers/classTreeDataProvider';
import { ClassResolver } from './utils/classResolver';

export function activate(context: vscode.ExtensionContext) {
  // 1. Register virtual document provider
  const docProvider = new BytecodeDocumentProvider();
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      BytecodeDocumentProvider.SCHEME,
      docProvider
    )
  );

  // 2. Register compiled classes tree view
  const treeDataProvider = new ClassTreeDataProvider();
  const treeView = vscode.window.createTreeView('java-bytecode-explorer', {
    treeDataProvider,
    showCollapseAll: true
  });
  context.subscriptions.push(treeView, {
    dispose: () => treeDataProvider.dispose()
  });

  // Helper function to open bytecode document
  const openBytecode = async (classFilePath: string, viewColumn?: vscode.ViewColumn) => {
    const uri = BytecodeDocumentProvider.getUriForClassFile(classFilePath);
    try {
      const doc = await vscode.workspace.openTextDocument(uri);
      await vscode.languages.setTextDocumentLanguage(doc, 'java-bytecode');
      await vscode.window.showTextDocument(doc, {
        preview: false,
        viewColumn: viewColumn ?? vscode.ViewColumn.Active,
        preserveFocus: false
      });
    } catch (err: any) {
      vscode.window.showErrorMessage(`Erreur lors de l'ouverture du bytecode : ${err?.message || err}`);
    }
  };

  // 3. Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('javaBytecode.refreshTree', () => {
      treeDataProvider.refresh();
    }),

    vscode.commands.registerCommand('javaBytecode.openClassBytecode', async (itemOrPath: any) => {
      let classFilePath: string | undefined;

      if (typeof itemOrPath === 'string') {
        classFilePath = itemOrPath;
      } else if (itemOrPath && typeof itemOrPath.fullPath === 'string') {
        classFilePath = itemOrPath.fullPath;
      } else if (itemOrPath && itemOrPath.fsPath) {
        classFilePath = itemOrPath.fsPath;
      }

      if (classFilePath) {
        if (classFilePath.endsWith('.javap')) {
          classFilePath = classFilePath.slice(0, -6);
        }
        await openBytecode(classFilePath);
      }
    }),

    vscode.commands.registerCommand('javaBytecode.showCurrentFileBytecode', async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri || !targetUri.fsPath.endsWith('.java')) {
        vscode.window.showInformationMessage("Ouvrez d'abord un fichier source Java (.java).");
        return;
      }

      const classPath = await ClassResolver.findClassForJavaFile(targetUri);
      if (!classPath) {
        vscode.window.showWarningMessage(
          `Aucun fichier .class compilé trouvé pour ${targetUri.fsPath.split(/[\\/]/).pop()}. Compilez votre projet Java (mvn compile / gradle build) et réessayez.`
        );
        return;
      }

      // Open beside like in IntelliJ IDEA
      await openBytecode(classPath, vscode.ViewColumn.Beside);
    }),

    vscode.commands.registerCommand('javaBytecode.notifyClassChanged', (uri: vscode.Uri) => {
      docProvider.refresh(uri);
    })
  );
}

export function deactivate() {}

