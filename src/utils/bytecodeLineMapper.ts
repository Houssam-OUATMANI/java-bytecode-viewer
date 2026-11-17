import type * as vscode from 'vscode';

export class BytecodeLineMapper {
  private static isMethodDeclaration(text: string): boolean {
    return (
      text.startsWith('  ') &&
      !text.startsWith('    ') &&
      ((text.trim().includes('(') && text.trim().endsWith(';')) || text.trim() === 'static {};')
    );
  }

  /**
   * Finds the line index in the bytecode document that corresponds to a given Java source line (1-based)
   */
  public static findBytecodeLineForSourceLine(bytecodeDoc: vscode.TextDocument, sourceLine: number): number | null {
    const lineCount = bytecodeDoc.lineCount;
    const lineTableEntryRegex = /line\s+(\d+):\s*(\d+)/g;
    let closestSourceLineDiff = Infinity;
    let foundLineIndex: number | null = null;

    for (let i = 0; i < lineCount; i++) {
      if (!this.isMethodDeclaration(bytecodeDoc.lineAt(i).text)) {
        continue;
      }

      let methodEnd = i + 1;
      while (methodEnd < lineCount) {
        const text = bytecodeDoc.lineAt(methodEnd).text;
        if (this.isMethodDeclaration(text) || text.trim() === '}') {
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

  /**
   * Finds the 1-based Java source line number corresponding to a given bytecode line index (0-based)
   */
  public static findSourceLineForBytecodeLine(bytecodeDoc: vscode.TextDocument, bytecodeLineIndex: number): number | null {
    const lineCount = bytecodeDoc.lineCount;
    if (bytecodeLineIndex < 0 || bytecodeLineIndex >= lineCount) {
      return null;
    }

    // 1. Identify which method contains bytecodeLineIndex
    let methodStart = -1;
    let methodEnd = -1;

    for (let i = bytecodeLineIndex; i >= 0; i--) {
      const text = bytecodeDoc.lineAt(i).text;
      if (this.isMethodDeclaration(text)) {
        methodStart = i;
        break;
      }
      if (text.trim() === '{') {
        break;
      }
    }

    if (methodStart === -1) {
      return null;
    }

    for (let i = methodStart + 1; i < lineCount; i++) {
      const text = bytecodeDoc.lineAt(i).text;
      if (this.isMethodDeclaration(text) || text.trim() === '}') {
        methodEnd = i;
        break;
      }
    }

    if (methodEnd === -1) {
      methodEnd = lineCount;
    }

    if (bytecodeLineIndex < methodStart || bytecodeLineIndex >= methodEnd) {
      return null;
    }

    // 2. Parse LineNumberTable within this method
    const lineTableEntryRegex = /line\s+(\d+):\s*(\d+)/g;
    const lineEntries: Array<{ sourceLine: number; offset: number }> = [];

    // Also find instructions and their line numbers
    let targetOffset: number | null = null;
    const lineText = bytecodeDoc.lineAt(bytecodeLineIndex).text;
    const currentInstructionMatch = lineText.match(/^\s*(\d+):/);
    if (currentInstructionMatch) {
      targetOffset = Number(currentInstructionMatch[1]);
    } else {
      // Find nearest preceding instruction in this method
      for (let j = bytecodeLineIndex - 1; j > methodStart; j--) {
        const prevText = bytecodeDoc.lineAt(j).text;
        const prevMatch = prevText.match(/^\s*(\d+):/);
        if (prevMatch) {
          targetOffset = Number(prevMatch[1]);
          break;
        }
      }
    }

    for (let j = methodStart + 1; j < methodEnd; j++) {
      const text = bytecodeDoc.lineAt(j).text;
      lineTableEntryRegex.lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = lineTableEntryRegex.exec(text)) !== null) {
        lineEntries.push({ sourceLine: Number(match[1]), offset: Number(match[2]) });
      }
    }

    if (lineEntries.length === 0) {
      return null;
    }

    // Sort entries by offset ascending
    lineEntries.sort((a, b) => a.offset - b.offset);

    if (targetOffset === null) {
      // Default to first entry in LineNumberTable if in method header
      return lineEntries[0].sourceLine;
    }

    // Find the entry with offset <= targetOffset with highest offset
    let bestSourceLine = lineEntries[0].sourceLine;
    for (const entry of lineEntries) {
      if (entry.offset <= targetOffset) {
        bestSourceLine = entry.sourceLine;
      } else {
        break;
      }
    }

    return bestSourceLine;
  }
}
