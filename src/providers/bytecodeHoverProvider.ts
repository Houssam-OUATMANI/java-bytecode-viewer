import * as vscode from 'vscode';
import { JVM_OPCODES } from '../disassembler/jvmOpcodes';

export class BytecodeHoverProvider implements vscode.HoverProvider {
  public provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    _token: vscode.CancellationToken
  ): vscode.ProviderResult<vscode.Hover> {
    const range = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_#]+/);
    if (!range) {
      return null;
    }

    const word = document.getText(range);

    // 1. Check JVM Opcodes
    const opcode = JVM_OPCODES[word.toLowerCase()];
    if (opcode) {
      const md = new vscode.MarkdownString();
      md.isTrusted = true;
      md.appendMarkdown(`### \`${opcode.mnemonic}\` — *JVM Opcode*\n\n`);
      md.appendMarkdown(`**Category:** \`${opcode.category}\`\n\n`);
      md.appendMarkdown(`**Operand Stack:**\n\`\`\`\n${opcode.stack}\n\`\`\`\n\n`);
      if (opcode.operands) {
        md.appendMarkdown(`**Operands:** \`${opcode.operands}\`\n\n`);
      }
      md.appendMarkdown(`${opcode.description}\n\n`);
      md.appendMarkdown(`---\n*Java Virtual Machine (JVM) Specification*`);
      return new vscode.Hover(md, range);
    }

    // 2. Check Constant Pool Tag in declarations (e.g. #1 = Methodref)
    const lineText = document.lineAt(position.line).text;
    const tagMatch = lineText.match(/^\s*(#\d+)\s*=\s*([A-Za-z]+)\b/);
    if (tagMatch && range.start.character >= lineText.indexOf(tagMatch[2]) && range.end.character <= lineText.indexOf(tagMatch[2]) + tagMatch[2].length) {
      const tag = tagMatch[2];
      const tagDocs: Record<string, string> = {
        Methodref: 'Reference to a method declared in a class.',
        Fieldref: 'Reference to a field in a class or instance.',
        InterfaceMethodref: 'Reference to a method declared in an interface.',
        Class: 'Reference to a class or interface (fully qualified binary name).',
        NameAndType: 'Pair representing field or method name and type descriptor (e.g. `<init>:()V`).',
        Utf8: 'String constant encoded in modified UTF-8 (identifiers, descriptors, strings).',
        String: 'Literal instance of `java.lang.String`.',
        Integer: '32-bit signed integer constant.',
        Float: '32-bit single-precision floating-point constant.',
        Long: '64-bit signed two\'s-complement integer (occupies 2 consecutive slots in the Constant Pool).',
        Double: '64-bit double-precision floating-point number (occupies 2 consecutive slots in the Constant Pool).',
        InvokeDynamic: 'Dynamic call site entry containing a bootstrap method specifier and NameAndType.',
        MethodHandle: 'Direct handle to an underlying method, constructor, or field (Java 7+).',
        MethodType: 'Method signature descriptor representing parameter types and return type (Java 7+).'
      };

      if (tagDocs[tag]) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### \`${tag}\` — *Constant Pool Tag*\n\n${tagDocs[tag]}`);
        return new vscode.Hover(md, range);
      }
    }

    // 3. Check Constant Pool Index Reference (e.g. #15 in instructions or CP definitions)
    if (word.startsWith('#') && /^#\d+$/.test(word)) {
      const targetIndex = word;
      // Search for the declaration line: "   #15 = ..."
      const declRegex = new RegExp(`^\\s*${targetIndex}\\s*=\\s*`);
      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i).text;
        if (declRegex.test(line)) {
          const md = new vscode.MarkdownString();
          md.isTrusted = true;
          md.appendMarkdown(`### \`${targetIndex}\` — *Constant Pool Entry*\n\n`);
          md.appendCodeblock(line.trim(), 'java-bytecode');
          md.appendMarkdown(`\n*(Line ${i + 1} in Constant Pool)*`);
          return new vscode.Hover(md, range);
        }
        if (line.trim() === '{') {
          break; // Constant Pool ended
        }
      }
    }

    return null;
  }
}
