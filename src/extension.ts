import * as vscode from 'vscode';
import { BytecodeDocumentProvider } from './providers/bytecodeDocumentProvider';
import { ClassTreeDataProvider } from './providers/classTreeDataProvider';
import { BytecodeSymbolProvider } from './providers/bytecodeSymbolProvider';
import { BytecodeLinkProvider } from './providers/bytecodeLinkProvider';
import { BytecodeHoverProvider } from './providers/bytecodeHoverProvider';
import { BytecodeFoldingProvider } from './providers/bytecodeFoldingProvider';
import { BytecodeDiffManager } from './providers/bytecodeDiffManager';
import { ClassResolver } from './utils/classResolver';
import { BytecodeLineMapper } from './utils/bytecodeLineMapper';
import { JavapRunner } from './disassembler/javapRunner';

export function activate(context: vscode.ExtensionContext) {
  // 1. Register virtual document providers
  const docProvider = new BytecodeDocumentProvider();
  const diffProvider = new BytecodeDiffManager();

  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      BytecodeDocumentProvider.SCHEME,
      docProvider
    ),
    vscode.workspace.registerTextDocumentContentProvider(
      BytecodeDiffManager.SNAPSHOT_SCHEME,
      diffProvider
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

  // 3. Register Language Providers
  const bytecodeSelector: vscode.DocumentSelector = [
    { language: 'java-bytecode' },
    { scheme: BytecodeDocumentProvider.SCHEME },
    { scheme: BytecodeDiffManager.SNAPSHOT_SCHEME }
  ];

  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(bytecodeSelector, new BytecodeSymbolProvider()),
    vscode.languages.registerDocumentLinkProvider(bytecodeSelector, new BytecodeLinkProvider()),
    vscode.languages.registerHoverProvider(bytecodeSelector, new BytecodeHoverProvider()),
    vscode.languages.registerFoldingRangeProvider(bytecodeSelector, new BytecodeFoldingProvider())
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

  // Helper to extract clean class file path from item or uri
  const resolveClassFilePath = (itemOrPath: any): string | undefined => {
    let classFilePath: string | undefined;
    if (typeof itemOrPath === 'string') {
      classFilePath = itemOrPath;
    } else if (itemOrPath && typeof itemOrPath.fullPath === 'string') {
      classFilePath = itemOrPath.fullPath;
    } else if (itemOrPath && itemOrPath.fsPath) {
      classFilePath = itemOrPath.fsPath;
    } else if (vscode.window.activeTextEditor?.document.uri.scheme === BytecodeDocumentProvider.SCHEME) {
      classFilePath = BytecodeDocumentProvider.getClassFilePathFromUri(
        vscode.window.activeTextEditor.document.uri
      );
    }

    if (classFilePath && classFilePath.endsWith('.javap')) {
      classFilePath = classFilePath.slice(0, -6);
    }
    return classFilePath;
  };

  // Helper to toggle a configuration boolean and refresh current bytecode view
  const toggleSetting = async (
    key: 'verbose' | 'showPrivateMembers' | 'showLineAndLocalVariableTables' | 'showInternalSignatures',
    name: string
  ) => {
    const config = vscode.workspace.getConfiguration('javaBytecode');
    const current = config.get<boolean>(key, false);
    let target = vscode.ConfigurationTarget.Workspace;

    if (!vscode.workspace.workspaceFolders?.length) {
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

    vscode.commands.registerCommand('javaBytecode.toggleSignatures', () => {
      toggleSetting('showInternalSignatures', 'Signatures internes (-s)');
    }),

    vscode.commands.registerCommand('javaBytecode.openClassBytecode', async (itemOrPath: any) => {
      const classFilePath = resolveClassFilePath(itemOrPath);
      if (classFilePath) {
        await openBytecode(classFilePath);
      }
    }),

    vscode.commands.registerCommand('javaBytecode.takeSnapshot', async (itemOrPath: any) => {
      const classFilePath = resolveClassFilePath(itemOrPath);
      if (classFilePath) {
        await BytecodeDiffManager.takeSnapshot(classFilePath);
      }
    }),

    vscode.commands.registerCommand('javaBytecode.compareWithSnapshot', async (itemOrPath: any) => {
      const classFilePath = resolveClassFilePath(itemOrPath);
      if (classFilePath) {
        await BytecodeDiffManager.compareWithSnapshot(classFilePath);
      }
    }),

    vscode.commands.registerCommand('javaBytecode.selectForCompare', (itemOrPath: any) => {
      const classFilePath = resolveClassFilePath(itemOrPath);
      if (classFilePath) {
        BytecodeDiffManager.selectForCompare(classFilePath);
      }
    }),

    vscode.commands.registerCommand('javaBytecode.compareWithSelected', async (itemOrPath: any) => {
      const classFilePath = resolveClassFilePath(itemOrPath);
      if (classFilePath) {
        await BytecodeDiffManager.compareWithSelected(classFilePath);
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

  // 5. Bi-directional Code <-> Bytecode Synchronisation with Debounce
  let syncDebounceTimer: NodeJS.Timeout | null = null;
  let isInternalSyncing = false;

  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection((e) => {
      const config = vscode.workspace.getConfiguration('javaBytecode');
      if (!config.get<boolean>('autoSyncCursor', true)) {
        return;
      }

      if (isInternalSyncing) {
        return;
      }

      if (syncDebounceTimer) {
        clearTimeout(syncDebounceTimer);
      }

      syncDebounceTimer = setTimeout(async () => {
        const editorDoc = e.textEditor.document;

        // Direction A: Java Source (.java) -> Bytecode View
        if (editorDoc.uri.fsPath.endsWith('.java')) {
          const bytecodeEditor = vscode.window.visibleTextEditors.find(
            (editor) => editor.document.uri.scheme === BytecodeDocumentProvider.SCHEME
          );

          if (!bytecodeEditor) {
            return;
          }

          const currentLine = e.selections[0].active.line + 1;
          const targetBytecodeLine = BytecodeLineMapper.findBytecodeLineForSourceLine(
            bytecodeEditor.document,
            currentLine
          );

          if (targetBytecodeLine !== null) {
            isInternalSyncing = true;
            const lineRange = bytecodeEditor.document.lineAt(targetBytecodeLine).range;
            bytecodeEditor.revealRange(lineRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            bytecodeEditor.selection = new vscode.Selection(lineRange.start, lineRange.end);
            setTimeout(() => {
              isInternalSyncing = false;
            }, 250);
          }
          return;
        }

        // Direction B: Bytecode View (javabytecode://) -> Java Source (.java)
        if (editorDoc.uri.scheme === BytecodeDocumentProvider.SCHEME) {
          const classFilePath = BytecodeDocumentProvider.getClassFilePathFromUri(editorDoc.uri);
          const currentBytecodeLine = e.selections[0].active.line;

          const sourceLine = BytecodeLineMapper.findSourceLineForBytecodeLine(
            editorDoc,
            currentBytecodeLine
          );

          if (sourceLine === null) {
            return;
          }

          // Find if matching .java editor is already visible
          let javaEditor = vscode.window.visibleTextEditors.find(
            (ed) => ed.document.uri.fsPath.endsWith('.java')
          );

          if (!javaEditor) {
            // Locate Java source file and open it beside if possible
            const javaUri = await ClassResolver.findJavaFileForClass(classFilePath);
            if (javaUri) {
              const doc = await vscode.workspace.openTextDocument(javaUri);
              javaEditor = await vscode.window.showTextDocument(doc, {
                viewColumn: vscode.ViewColumn.One,
                preserveFocus: true
              });
            }
          }

          if (javaEditor) {
            isInternalSyncing = true;
            const targetLineIndex = Math.max(0, Math.min(sourceLine - 1, javaEditor.document.lineCount - 1));
            const lineRange = javaEditor.document.lineAt(targetLineIndex).range;
            javaEditor.revealRange(lineRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
            javaEditor.selection = new vscode.Selection(lineRange.start, lineRange.end);
            setTimeout(() => {
              isInternalSyncing = false;
            }, 250);
          }
        }
      }, 120);
    })
  );
}

export function deactivate() {}
