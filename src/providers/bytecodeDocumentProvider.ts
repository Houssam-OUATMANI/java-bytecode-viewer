import * as vscode from 'vscode';
import { JavapRunner } from '../disassembler/javapRunner';

export class BytecodeDocumentProvider implements vscode.TextDocumentContentProvider {
  public static readonly SCHEME = 'javabytecode';

  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  readonly onDidChange = this._onDidChange.event;

  public refresh(uri: vscode.Uri): void {
    this._onDidChange.fire(uri);
  }

  public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
    const classFilePath = BytecodeDocumentProvider.getClassFilePathFromUri(uri);
    try {
      const output = await JavapRunner.disassemble(classFilePath);
      return output;
    } catch (err: any) {
      return `// Erreur lors du désassemblage de ${classFilePath} :\n// ${err?.message || err}\n\n// Vérifiez les paramètres de l'extension (javaBytecode.javapPath).`;
    }
  }

  public static getUriForClassFile(classFilePath: string): vscode.Uri {
    return vscode.Uri.file(classFilePath).with({
      scheme: BytecodeDocumentProvider.SCHEME,
      path: classFilePath + '.javap'
    });
  }

  public static getClassFilePathFromUri(uri: vscode.Uri): string {
    const p = uri.fsPath;
    if (p.endsWith('.javap')) {
      return p.slice(0, -6);
    }
    return p;
  }
}

