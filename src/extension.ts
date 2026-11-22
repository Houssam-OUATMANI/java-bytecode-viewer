import * as vscode from 'vscode';
import * as path from 'path';
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
      vscode.window.showErrorMessage(`Unable to update setting "${name}": ${message}`);
      return;
    }

    JavapRunner.clearCache();

    // Refresh active bytecode document if open
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor && activeEditor.document.uri.scheme === BytecodeDocumentProvider.SCHEME) {
      docProvider.refresh(activeEditor.document.uri);
    }
    vscode.window.setStatusBarMessage(`${name}: ${!current ? 'Enabled' : 'Disabled'}`, 3000);
  };

  // 4. Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('javaBytecode.refreshTree', () => {
      treeDataProvider.refresh();
    }),

    vscode.commands.registerCommand('javaBytecode.toggleVerbose', () => {
      toggleSetting('verbose', 'Verbose & Constant Pool');
    }),

    vscode.commands.registerCommand('javaBytecode.togglePrivateMembers', () => {
      toggleSetting('showPrivateMembers', 'Private Members');
    }),

    vscode.commands.registerCommand('javaBytecode.toggleLineNumbers', () => {
      toggleSetting('showLineAndLocalVariableTables', 'Line & Variable Tables');
    }),

    vscode.commands.registerCommand('javaBytecode.toggleSignatures', () => {
      toggleSetting('showInternalSignatures', 'Internal Signatures (-s)');
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

    vscode.commands.registerCommand('javaBytecode.goToSourceFile', async (itemOrUri?: any) => {
      let classFilePath: string | undefined;

      if (vscode.window.activeTextEditor?.document.uri.scheme === BytecodeDocumentProvider.SCHEME) {
        classFilePath = BytecodeDocumentProvider.getClassFilePathFromUri(
          vscode.window.activeTextEditor.document.uri
        );
      } else {
        classFilePath = resolveClassFilePath(itemOrUri);
      }

      if (!classFilePath) {
        vscode.window.showInformationMessage("Please open a bytecode document first.");
        return;
      }

      const sourceUri = await ClassResolver.findJavaFileForClass(classFilePath);
      if (!sourceUri) {
        vscode.window.showWarningMessage(
          `Source file (.java / .kt) not found for ${path.basename(classFilePath)}.`
        );
        return;
      }

      const doc = await vscode.workspace.openTextDocument(sourceUri);
      let targetLine = 0;

      // If active editor is bytecode, find line matching current bytecode position
      if (vscode.window.activeTextEditor?.document.uri.scheme === BytecodeDocumentProvider.SCHEME) {
        const curLine = vscode.window.activeTextEditor.selection.active.line;
        const mappedLine = BytecodeLineMapper.findSourceLineForBytecodeLine(
          vscode.window.activeTextEditor.document,
          curLine
        );
        if (mappedLine !== null) {
          targetLine = Math.max(0, mappedLine - 1);
        }
      }

      const editor = await vscode.window.showTextDocument(doc, {
        viewColumn: vscode.ViewColumn.One,
        preserveFocus: false
      });

      if (targetLine < doc.lineCount) {
        const range = doc.lineAt(targetLine).range;
        editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
        editor.selection = new vscode.Selection(range.start, range.end);
      }
    }),

    vscode.commands.registerCommand('javaBytecode.showCurrentFileBytecode', async (uri?: vscode.Uri) => {
      const targetUri = uri || vscode.window.activeTextEditor?.document.uri;
      if (!targetUri || (!targetUri.fsPath.endsWith('.java') && !targetUri.fsPath.endsWith('.kt'))) {
        vscode.window.showInformationMessage("Please open a Java (.java) or Kotlin (.kt) source file first.");
        return;
      }

      const classPath = await ClassResolver.findClassForJavaFile(targetUri);
      if (!classPath) {
        vscode.window.showWarningMessage(
          `No compiled .class file found for ${targetUri.fsPath.split(/[\\/]/).pop()}. Compile your Java/Kotlin project (mvn compile / gradle build) and try again.`
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

        // Direction A: Java/Kotlin Source (.java / .kt) -> Bytecode View
        const isSourceFile = editorDoc.uri.fsPath.endsWith('.java') || editorDoc.uri.fsPath.endsWith('.kt');
        if (isSourceFile) {
          const expectedClass = await ClassResolver.findClassForJavaFile(editorDoc.uri);
          if (!expectedClass) {
            return;
          }

          const normalizedExpectedClass = path.normalize(expectedClass).toLowerCase();
          const bytecodeEditor = vscode.window.visibleTextEditors.find((editor) => {
            if (editor.document.uri.scheme !== BytecodeDocumentProvider.SCHEME) {
              return false;
            }
            const editorClass = BytecodeDocumentProvider.getClassFilePathFromUri(editor.document.uri);
            return path.normalize(editorClass).toLowerCase() === normalizedExpectedClass;
          });

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

        // Direction B: Bytecode View (javabytecode://) -> Java/Kotlin Source
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

          // Locate source file for this class
          const targetSourceUri = await ClassResolver.findJavaFileForClass(classFilePath);
          if (!targetSourceUri) {
            return;
          }

          // Check if the matching source file is ALREADY visible in an editor
          const normalizedTargetSource = path.normalize(targetSourceUri.fsPath).toLowerCase();
          const sourceEditor = vscode.window.visibleTextEditors.find(
            (ed) => path.normalize(ed.document.uri.fsPath).toLowerCase() === normalizedTargetSource
          );

          // IMPORTANT: Only sync with an ALREADY visible editor.
          // Do NOT automatically open closed documents on cursor change!
          if (!sourceEditor) {
            return;
          }

          isInternalSyncing = true;
          const targetLineIndex = Math.max(0, Math.min(sourceLine - 1, sourceEditor.document.lineCount - 1));
          const lineRange = sourceEditor.document.lineAt(targetLineIndex).range;
          sourceEditor.revealRange(lineRange, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
          sourceEditor.selection = new vscode.Selection(lineRange.start, lineRange.end);
          setTimeout(() => {
            isInternalSyncing = false;
          }, 250);
        }
      }, 120);
    })
  );
}

export function deactivate() {}
