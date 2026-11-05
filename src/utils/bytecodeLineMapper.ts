import type * as vscode from 'vscode';

export class BytecodeLineMapper {
  /**
   * Finds the line index in the bytecode document that corresponds to a given Java source line (1-based)
   */
  public static findBytecodeLineForSourceLine(bytecodeDoc: vscode.TextDocument, sourceLine: number): number | null {
    const lineCount = bytecodeDoc.lineCount;
    const lineTableEntryRegex = /line\s+(\d+):\s*(\d+)/g;
    let closestSourceLineDiff = Infinity;
    let foundLineIndex: number | null = null;

    const isMethodDeclaration = (text: string) =>
      text.startsWith('  ') &&
      !text.startsWith('    ') &&
      ((text.trim().includes('(') && text.trim().endsWith(';')) || text.trim() === 'static {};');

    for (let i = 0; i < lineCount; i++) {
      if (!isMethodDeclaration(bytecodeDoc.lineAt(i).text)) {
        continue;
      }

      let methodEnd = i + 1;
      while (methodEnd < lineCount) {
        const text = bytecodeDoc.lineAt(methodEnd).text;
        if (isMethodDeclaration(text) || text.trim() === '}') {
          break;
        }
        methodEnd++;
      }

      const instructions = new Map<number, number>();
      const lineEntries: Array<{ sourceLine: number; offset: number }> = [];

      for (let j = i + 1; j < methodEnd; j++) {
        const text = bytecodeDoc.lineAt(j).text;
        const instructionMatch = text.match(/^\s*(\d+):/);
        if (instructionMatch) {
          instructions.set(Number(instructionMatch[1]), j);
        }

        lineTableEntryRegex.lastIndex = 0;
        let match: RegExpExecArray | null;
        while ((match = lineTableEntryRegex.exec(text)) !== null) {
          lineEntries.push({ sourceLine: Number(match[1]), offset: Number(match[2]) });
        }
      }

      for (const entry of lineEntries) {
        const diff = sourceLine - entry.sourceLine;
        if (diff >= 0 && diff < closestSourceLineDiff) {
          const instructionLine = instructions.get(entry.offset);
          if (instructionLine !== undefined) {
            closestSourceLineDiff = diff;
            foundLineIndex = instructionLine;
          }
        }
      }

      i = methodEnd - 1;
    }

    return foundLineIndex;
  }
}
