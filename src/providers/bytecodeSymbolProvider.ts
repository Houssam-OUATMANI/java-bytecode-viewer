import * as vscode from 'vscode';

export class BytecodeSymbolProvider implements vscode.DocumentSymbolProvider {
  public provideDocumentSymbols(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
    const symbols: vscode.DocumentSymbol[] = [];
    const lineCount = document.lineCount;

    let classSymbol: vscode.DocumentSymbol | null = null;
    let constantPoolSymbol: vscode.DocumentSymbol | null = null;
    let insideClassBody = false;

    for (let i = 0; i < lineCount; i++) {
      const line = document.lineAt(i);
      const text = line.text;

      // 1. Detect Class Header
      if (!insideClassBody && (text.includes('class ') || text.includes('interface ') || text.includes('enum ') || text.includes('record '))) {
        const match = text.match(/(public\s+|final\s+|abstract\s+)*(class|interface|enum|record)\s+([^\s{]+)/);
        const name = match ? match[3] : text.trim();
        classSymbol = new vscode.DocumentSymbol(
          name,
          'Class',
          vscode.SymbolKind.Class,
          line.range,
          line.range
        );
        symbols.push(classSymbol);
      }

      // 2. Detect Constant Pool
      if (text.startsWith('Constant pool:')) {
        let endLine = i;
        for (let j = i + 1; j < lineCount; j++) {
          if (document.lineAt(j).text.startsWith('{')) {
            endLine = j - 1;
            break;
          }
        }
        const range = new vscode.Range(i, 0, endLine, document.lineAt(endLine).text.length);
        constantPoolSymbol = new vscode.DocumentSymbol(
          'Constant Pool',
          'Table',
          vscode.SymbolKind.Array,
          range,
          line.range
        );
        symbols.push(constantPoolSymbol);
      }

      // 3. Class body start and end
      if (text.trim() === '{') {
        insideClassBody = true;
        continue;
      }
      if (text.trim() === '}' && insideClassBody) {
        insideClassBody = false;
        continue;
      }

      // 4. Inside class body: detect Methods and Fields
      // In javap, method and field declarations start with 2 spaces and end with ';'
      if (insideClassBody && text.startsWith('  ') && !text.startsWith('    ') && text.trim().endsWith(';')) {
        const memberText = text.trim();
        const isMethod = memberText.includes('(') && memberText.includes(')');
        const isConstructor = isMethod && (memberText.includes('<init>') || (classSymbol && memberText.includes(classSymbol.name.split('.').pop() + '(')));

        const kind = isConstructor
          ? vscode.SymbolKind.Constructor
          : isMethod
          ? vscode.SymbolKind.Method
          : vscode.SymbolKind.Field;

        // Find the range of this member until next empty line or next member
        let endLine = i;
        for (let j = i + 1; j < lineCount; j++) {
          const nextText = document.lineAt(j).text;
          if (nextText.trim() === '' || (nextText.startsWith('  ') && !nextText.startsWith('    ') && nextText.trim().endsWith(';')) || nextText.trim() === '}') {
            endLine = j - 1;
            break;
          }
        }

        const fullRange = new vscode.Range(i, 0, Math.max(i, endLine), document.lineAt(Math.max(i, endLine)).text.length);
        const memberSymbol = new vscode.DocumentSymbol(
          memberText.replace(/;$/, ''),
          isMethod ? 'Method' : 'Field',
          kind,
          fullRange,
          line.range
        );

        if (classSymbol) {
          classSymbol.children.push(memberSymbol);
        } else {
          symbols.push(memberSymbol);
        }
      }
    }

    return symbols;
  }
}

