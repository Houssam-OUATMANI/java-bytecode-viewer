import * as vscode from 'vscode';

export class BytecodeLineMapper {
  /**
   * Finds the line index in the bytecode document that corresponds to a given Java source line (1-based)
   */
  public static findBytecodeLineForSourceLine(bytecodeDoc: vscode.TextDocument, sourceLine: number): number | null {
    const lineCount = bytecodeDoc.lineCount;

    // Pattern for LineNumberTable entries: "line 3: 0"
    const lineTableEntryRegex = /line\s+(\d+):\s*(\d+)/g;

    let bestBytecodeOffset: number | null = null;
    let closestSourceLineDiff = Infinity;
    let foundLineIndex: number | null = null;

    // Find closest source line in LineNumberTable
    for (let i = 0; i < lineCount; i++) {
      const text = bytecodeDoc.lineAt(i).text;
      let match: RegExpExecArray | null;
      while ((match = lineTableEntryRegex.exec(text)) !== null) {
        const tableSourceLine = parseInt(match[1], 10);
        const bytecodeOffset = parseInt(match[2], 10);

        const diff = Math.abs(tableSourceLine - sourceLine);
        if (tableSourceLine <= sourceLine && diff < closestSourceLineDiff) {
          closestSourceLineDiff = diff;
          bestBytecodeOffset = bytecodeOffset;
        }
      }
    }

    if (bestBytecodeOffset === null) {
      return null;
    }

    // Now locate the instruction offset line (e.g. "   0: aload_0" or "  12: goto")
    const offsetRegex = new RegExp(`^\\s*${bestBytecodeOffset}:`);
    for (let i = 0; i < lineCount; i++) {
      if (offsetRegex.test(bytecodeDoc.lineAt(i).text)) {
        return i;
      }
    }

    return null;
  }
}

