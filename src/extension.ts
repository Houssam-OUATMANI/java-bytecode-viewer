import * as vscode from 'vscode';
import { BytecodeDocumentProvider } from './providers/bytecodeDocumentProvider';
import { ClassTreeDataProvider } from './providers/classTreeDataProvider';
import { BytecodeSymbolProvider } from './providers/bytecodeSymbolProvider';
import { BytecodeLinkProvider } from './providers/bytecodeLinkProvider';
import { ClassResolver } from './utils/classResolver';
import { BytecodeLineMapper } from './utils/bytecodeLineMapper';
import { JavapRunner } from './disassembler/javapRunner';

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

  // 3. Register Language Providers (Outline Symbols & Clickable Links)
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      { language: 'java-bytecode' },
      new BytecodeSymbolProvider()
    ),
    vscode.languages.registerDocumentLinkProvider(
      { language: 'java-bytecode' },
      new BytecodeLinkProvider()
    )
  );

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

  // Helper to toggle a configuration boolean and refresh current bytecode view
  const toggleSetting = async (key: 'verbose' | 'showPrivateMembers' | 'showLineAndLocalVariableTables', name: string) => {
    const config = vscode.workspace.getConfiguration('javaBytecode');
    const current = config.get<boolean>(key, true);
    let target = vscode.ConfigurationTarget.Workspace;

    if (!vscode.workspace.workspaceFolders?.length) {
      const choice = await vscode.window.showWarningMessage(
        'Aucun espace de travail ouvert. Voulez-vous modifier ce réglage globalement ?',
        { modal: true },
        'Modifier globalement'
      );
      if (choice !== 'Modifier globalement') {
        return;
      }
      target = vscode.ConfigurationTarget.Global;
    }

    try {
      await config.update(key, !current, target);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Impossible de modifier le réglage « ${name} » : ${message}`);
      return;
    }

    JavapRunner.clearCache();

    // Refresh active bytecode document if open
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.scheme === BytecodeDocumentProvider.SCHEME) {
      docProvider.refresh(activeEditor.document.uri);
    }
    vscode.window.setStatusBarMessage(`${name} : ${!current ? 'Activé' : 'Désactivé'}`, 3000);
  };

  // 4. Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('javaBytecode.refreshTree', () => {
      treeDataProvider.refresh();
    }),

    vscode.commands.registerCommand('javaBytecode.toggleVerbose', () => {
      toggleSetting('verbose', 'Mode Verbose & Constant Pool');
    }),

    vscode.commands.registerCommand('javaBytecode.togglePrivateMembers', () => {
      toggleSetting('showPrivateMembers', 'Membres privés');
    }),

    vscode.commands.registerCommand('javaBytecode.toggleLineNumbers', () => {
      toggleSetting('showLineAndLocalVariableTables', 'Tables de lignes et variables');
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

      await openBytecode(classPath, vscode.ViewColumn.Beside);
    }),

    vscode.commands.registerCommand('javaBytecode.notifyClassChanged', (uri: vscode.Uri) => {
      docProvider.refresh(uri);
    })
  );

  // 5. Code <-> Bytecode Synchronisation on Cursor Movement
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const config = vscode.workspace.getConfiguration('javaBytecode');
      if (!config.get<boolean>('autoSyncCursor', true)) {
        return;
      }

      const sourceDoc = e.textEditor.document;
      if (!sourceDoc.uri.fsPath.endsWith('.java')) {
        return;
      }

      // Find visible editor displaying the bytecode
      const bytecodeEditor = vscode.window.visibleTextEditors.find(
        (editor) => editor.document.uri.scheme === BytecodeDocumentProvider.SCHEME
      );

      if (!bytecodeEditor) {
        return;
      }

      const currentLine = e.selections[0].active.line + 1; // 1-based source line
      const targetBytecodeLine = BytecodeLineMapper.findBytecodeLineForSourceLine(
        bytecodeEditor.document,
        currentLine
      );

      if (targetBytecodeLine !== null) {
        const lineRange = bytecodeEditor.document.lineAt(targetBytecodeLine).range;
        bytecodeEditor.revealRange(lineRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        bytecodeEditor.selection = new vscode.Selection(lineRange.start, lineRange.end);
      }
    })
  );
}

export function deactivate() {}
