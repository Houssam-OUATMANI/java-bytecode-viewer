import * as vscode from 'vscode';

export class BytecodeLinkProvider implements vscode.DocumentLinkProvider {
  public provideDocumentLinks(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.DocumentLink[]> {
    const links: vscode.DocumentLink[] = [];
    const poolIndexMap = new Map<number, number>(); // poolIndex -> lineNumber (0-based)

    // First pass: index the Constant Pool declarations
    for (let i = 0; i < document.lineCount; i++) {
      const lineText = document.lineAt(i).text;
      const match = lineText.match(/^\s*#(\d+)\s*=/);
      if (match) {
        const index = parseInt(match[1], 10);
        poolIndexMap.set(index, i);
      }
      if (lineText.trim() === '{') {
        // Passed constant pool
        break;
      }
    }

    if (poolIndexMap.size === 0) {
      return links;
    }

    // Second pass: find references to #<number> in instructions and constant pool definitions
    const refRegex = /#(\d+)/g;

    for (let i = 0; i < document.lineCount; i++) {
      const lineText = document.lineAt(i).text;
      const declMatch = lineText.match(/^\s*#(\d+)\s*=/);
      const declIndex = declMatch ? parseInt(declMatch[1], 10) : -1;

      let match: RegExpExecArray | null;
      while ((match = refRegex.exec(lineText)) !== null) {
        const refIndex = parseInt(match[1], 10);
        // Avoid self-linking declaration
        if (declIndex !== -1 && match.index === lineText.indexOf('#' + declIndex)) {
          continue;
        }

        const targetLine = poolIndexMap.get(refIndex);
        if (targetLine !== undefined) {
          const startPos = new vscode.Position(i, match.index);
          const endPos = new vscode.Position(i, match.index + match[0].length);
          const link = new vscode.DocumentLink(
            new vscode.Range(startPos, endPos),
            document.uri.with({ fragment: `${targetLine + 1}` })
          );
          link.tooltip = `Jump to Constant Pool #${refIndex}`;
          links.push(link);
        }
      }
    }

    return links;
  }
}

