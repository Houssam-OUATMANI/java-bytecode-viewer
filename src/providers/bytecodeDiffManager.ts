import * as vscode from 'vscode';
import * as path from 'path';
import { BytecodeDocumentProvider } from './bytecodeDocumentProvider';
import { JavapRunner } from '../disassembler/javapRunner';

export class BytecodeDiffManager implements vscode.TextDocumentContentProvider {
  public static readonly SNAPSHOT_SCHEME = 'javabytecode-snapshot';

  private static snapshots = new Map<string, { content: string; timestamp: Date }>();
  private static selectedForCompare: string | null = null;

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this._onDidChange.event;

  public provideTextDocumentContent(uri: vscode.Uri): string {
    const classFilePath = uri.path.endsWith('.javap') ? uri.path.slice(0, -6) : uri.path;
    const snapshot = BytecodeDiffManager.snapshots.get(classFilePath);
    if (!snapshot) {
      return `// No snapshot found for ${classFilePath}`;
    }
    return `// Snapshot taken at: ${snapshot.timestamp.toLocaleTimeString()}\n` + snapshot.content;
  }

  public static async takeSnapshot(classFilePath: string): Promise<void> {
    const content = await JavapRunner.disassemble(classFilePath);
    const now = new Date();
    this.snapshots.set(classFilePath, { content, timestamp: now });
    vscode.window.showInformationMessage(
      `Bytecode snapshot saved for ${path.basename(classFilePath)} (${now.toLocaleTimeString()}).`
    );
  }

  public static async compareWithSnapshot(classFilePath: string): Promise<void> {
    if (!this.snapshots.has(classFilePath)) {
      await this.takeSnapshot(classFilePath);
      vscode.window.showInformationMessage(
        "Initial snapshot recorded. Modify and recompile your code, then run 'Compare with Bytecode Snapshot'."
      );
      return;
    }

    const snapshot = this.snapshots.get(classFilePath)!;
    const baseName = path.basename(classFilePath);
    const snapshotUri = vscode.Uri.from({
      scheme: BytecodeDiffManager.SNAPSHOT_SCHEME,
      path: classFilePath + '.javap',
      query: `t=${snapshot.timestamp.getTime()}`
    });
    const currentUri = BytecodeDocumentProvider.getUriForClassFile(classFilePath);

    const title = `${baseName} [Snapshot ${snapshot.timestamp.toLocaleTimeString()}] ↔ Current`;
    await vscode.commands.executeCommand('vscode.diff', snapshotUri, currentUri, title);
  }

  public static selectForCompare(classFilePath: string): void {
    this.selectedForCompare = classFilePath;
    vscode.commands.executeCommand('setContext', 'javaBytecode.hasCompareSelection', true);
    vscode.window.showInformationMessage(
      `Selected for compare: ${path.basename(classFilePath)}. Right-click another class to compare.`
    );
  }

  public static async compareWithSelected(targetClassFilePath: string): Promise<void> {
    if (!this.selectedForCompare) {
      vscode.window.showWarningMessage("Please select a class first using 'Select for Bytecode Compare'.");
      return;
    }

    const firstClass = this.selectedForCompare;
    const secondClass = targetClassFilePath;

    const uri1 = BytecodeDocumentProvider.getUriForClassFile(firstClass);
    const uri2 = BytecodeDocumentProvider.getUriForClassFile(secondClass);

    const title = `${path.basename(firstClass)} ↔ ${path.basename(secondClass)}`;
    await vscode.commands.executeCommand('vscode.diff', uri1, uri2, title);
  }
}
