import * as vscode from 'vscode';

export class BytecodeFoldingProvider implements vscode.FoldingRangeProvider {
  public provideFoldingRanges(
    document: vscode.TextDocument,
    _context: vscode.FoldingContext,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.FoldingRange[]> {
    const ranges: vscode.FoldingRange[] = [];
    const lineCount = document.lineCount;

    let constantPoolStart = -1;
    let classBodyStart = -1;

    for (let i = 0; i < lineCount; i++) {
      const text = document.lineAt(i).text;

      // 1. Constant pool folding
      if (text.startsWith('Constant pool:')) {
        constantPoolStart = i;
        continue;
      }
      if (constantPoolStart !== -1 && text.trim() === '{') {
        ranges.push(new vscode.FoldingRange(constantPoolStart, i - 1, vscode.FoldingRangeKind.Region));
        constantPoolStart = -1;
      }

      // 2. Class body folding
      if (text.trim() === '{') {
        classBodyStart = i;
        continue;
      }
      if (text.trim() === '}' && classBodyStart !== -1) {
        ranges.push(new vscode.FoldingRange(classBodyStart, i, vscode.FoldingRangeKind.Region));
        classBodyStart = -1;
      }

      // 3. Method declarations & blocks
      if (
        text.startsWith('  ') &&
        !text.startsWith('    ') &&
        ((text.trim().includes('(') && text.trim().endsWith(';')) || text.trim() === 'static {};')
      ) {
        let methodEnd = i;
        for (let j = i + 1; j < lineCount; j++) {
          const nextText = document.lineAt(j).text;
          if (
            (nextText.startsWith('  ') && !nextText.startsWith('    ') && nextText.trim().endsWith(';')) ||
            nextText.trim() === '}'
          ) {
            methodEnd = j - 1;
            break;
          }
        }
        if (methodEnd > i) {
          ranges.push(new vscode.FoldingRange(i, methodEnd, vscode.FoldingRangeKind.Region));
        }
      }

      // 4. Sub-sections: Code, LineNumberTable, LocalVariableTable, StackMapTable
      const subSectionMatch = text.match(/^\s+(Code|LineNumberTable|LocalVariableTable|LocalVariableTypeTable|StackMapTable|Exceptions):/);
      if (subSectionMatch) {
        const currentIndent = text.search(/\S/);
        let subEnd = i;
        for (let j = i + 1; j < lineCount; j++) {
          const line = document.lineAt(j);
          if (line.isEmptyOrWhitespace) {
            subEnd = j - 1;
            break;
          }
          const indent = line.text.search(/\S/);
          if (indent <= currentIndent) {
            subEnd = j - 1;
            break;
          }
          subEnd = j;
        }
        if (subEnd > i) {
          ranges.push(new vscode.FoldingRange(i, subEnd, vscode.FoldingRangeKind.Region));
        }
      }
    }

    return ranges;
  }
}
