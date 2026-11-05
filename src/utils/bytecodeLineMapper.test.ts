import assert from 'node:assert/strict';
import type { TextDocument } from 'vscode';
import { BytecodeLineMapper } from './bytecodeLineMapper';

const documentFromText = (text: string): TextDocument => {
  const lines = text.split(/\r?\n/);
  return {
    lineCount: lines.length,
    lineAt: (line: number) => ({ text: lines[line] })
  } as TextDocument;
};

const bytecode = documentFromText(
  [
    'Compiled from "Sample.java"',
    'public class Sample {',
    '  public void first();',
    '    Code:',
    '       0: first_0',
    '       5: first_5',
    '    LineNumberTable:',
    '      line 10: 0',
    '      line 11: 5',
    '  public void second();',
    '    Code:',
    '       0: second_0',
    '    LineNumberTable:',
    '      line 20: 0',
    '  static {};',
    '    Code:',
    '       0: static_init',
    '    LineNumberTable:',
    '      line 30: 0',
    '}'
  ].join('\n')
);

assert.equal(BytecodeLineMapper.findBytecodeLineForSourceLine(bytecode, 12), 5);
assert.equal(BytecodeLineMapper.findBytecodeLineForSourceLine(bytecode, 21), 11);
assert.equal(BytecodeLineMapper.findBytecodeLineForSourceLine(bytecode, 31), 16);

const withoutLineTable = documentFromText(
  ['public class NoDebugInfo {', '  public void method();', '    Code:', '       0: return', '}'].join('\n')
);
assert.equal(BytecodeLineMapper.findBytecodeLineForSourceLine(withoutLineTable, 1), null);

console.log('BytecodeLineMapper tests passed.');
