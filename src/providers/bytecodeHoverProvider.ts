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
      md.appendMarkdown(`**Catégorie :** \`${opcode.category}\`\n\n`);
      md.appendMarkdown(`**Pile d'opérandes :**\n\`\`\`\n${opcode.stack}\n\`\`\`\n\n`);
      if (opcode.operands) {
        md.appendMarkdown(`**Opérandes :** \`${opcode.operands}\`\n\n`);
      }
      md.appendMarkdown(`${opcode.description}\n\n`);
      md.appendMarkdown(`---\n*Spécification Java Virtual Machine (JVM)*`);
      return new vscode.Hover(md, range);
    }

    // 2. Check Constant Pool Tag in declarations (e.g. #1 = Methodref)
    const lineText = document.lineAt(position.line).text;
    const tagMatch = lineText.match(/^\s*(#\d+)\s*=\s*([A-Za-z]+)\b/);
    if (tagMatch && range.start.character >= lineText.indexOf(tagMatch[2]) && range.end.character <= lineText.indexOf(tagMatch[2]) + tagMatch[2].length) {
      const tag = tagMatch[2];
      const tagDocs: Record<string, string> = {
        Methodref: 'Référence à une méthode déclarée dans une classe standard.',
        Fieldref: 'Référence à un champ (field) de classe ou d’instance.',
        InterfaceMethodref: 'Référence à une méthode déclarée dans une interface.',
        Class: 'Référence à une classe ou interface (nom fully qualified).',
        NameAndType: 'Paire nom de membre et descripteur de type (ex: `<init>:()V`).',
        Utf8: 'Chaîne de caractères encodée en format UTF-8 modifié (identifiants, descripteurs).',
        String: 'Instance littérale de `java.lang.String`.',
        Integer: 'Constante entière 32 bits.',
        Float: 'Constante à virgule flottante 32 bits.',
        Long: 'Constante entière 64 bits (occupe 2 entrées consécutives dans le Constant Pool).',
        Double: 'Constante à virgule flottante 64 bits (occupe 2 entrées consécutives).',
        InvokeDynamic: 'Point d’appel dynamique (bootstrap method specifier + NameAndType).',
        MethodHandle: 'Handle d’exécution directe d’une méthode ou d’un champ (Java 7+).',
        MethodType: 'Descripteur de signature de méthode (Java 7+).'
      };

      if (tagDocs[tag]) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`### \`${tag}\` — *Constant Pool Tag*\n\n${tagDocs[tag]}`);
        return new vscode.Hover(md, range);
      }
    }

    return null;
  }
}
