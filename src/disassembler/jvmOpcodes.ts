export interface JvmOpcodeDoc {
  mnemonic: string;
  category: string;
  stack: string;
  description: string;
  operands?: string;
}

export const JVM_OPCODES: Record<string, JvmOpcodeDoc> = {
  // Constants / Push
  nop: {
    mnemonic: 'nop',
    category: 'Constants',
    stack: '[no change]',
    description: 'Do nothing (No operation).'
  },
  aconst_null: {
    mnemonic: 'aconst_null',
    category: 'Constants',
    stack: '... → ..., null',
    description: 'Pushes a `null` reference onto the operand stack.'
  },
  iconst_m1: {
    mnemonic: 'iconst_m1',
    category: 'Constants',
    stack: '... → ..., -1',
    description: 'Pushes `int` constant `-1` onto the operand stack.'
  },
  iconst_0: { mnemonic: 'iconst_0', category: 'Constants', stack: '... → ..., 0', description: 'Pushes `int` constant `0` onto the operand stack.' },
  iconst_1: { mnemonic: 'iconst_1', category: 'Constants', stack: '... → ..., 1', description: 'Pushes `int` constant `1` onto the operand stack.' },
  iconst_2: { mnemonic: 'iconst_2', category: 'Constants', stack: '... → ..., 2', description: 'Pushes `int` constant `2` onto the operand stack.' },
  iconst_3: { mnemonic: 'iconst_3', category: 'Constants', stack: '... → ..., 3', description: 'Pushes `int` constant `3` onto the operand stack.' },
  iconst_4: { mnemonic: 'iconst_4', category: 'Constants', stack: '... → ..., 4', description: 'Pushes `int` constant `4` onto the operand stack.' },
  iconst_5: { mnemonic: 'iconst_5', category: 'Constants', stack: '... → ..., 5', description: 'Pushes `int` constant `5` onto the operand stack.' },
  lconst_0: { mnemonic: 'lconst_0', category: 'Constants', stack: '... → ..., 0L', description: 'Pushes `long` constant `0L` (2 slots) onto the operand stack.' },
  lconst_1: { mnemonic: 'lconst_1', category: 'Constants', stack: '... → ..., 1L', description: 'Pushes `long` constant `1L` (2 slots) onto the operand stack.' },
  fconst_0: { mnemonic: 'fconst_0', category: 'Constants', stack: '... → ..., 0.0f', description: 'Pushes `float` constant `0.0f` onto the operand stack.' },
  fconst_1: { mnemonic: 'fconst_1', category: 'Constants', stack: '... → ..., 1.0f', description: 'Pushes `float` constant `1.0f` onto the operand stack.' },
  fconst_2: { mnemonic: 'fconst_2', category: 'Constants', stack: '... → ..., 2.0f', description: 'Pushes `float` constant `2.0f` onto the operand stack.' },
  dconst_0: { mnemonic: 'dconst_0', category: 'Constants', stack: '... → ..., 0.0d', description: 'Pushes `double` constant `0.0d` (2 slots) onto the operand stack.' },
  dconst_1: { mnemonic: 'dconst_1', category: 'Constants', stack: '... → ..., 1.0d', description: 'Pushes `double` constant `1.0d` (2 slots) onto the operand stack.' },
  bipush: {
    mnemonic: 'bipush',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'byte',
    description: 'Pushes a signed 1-byte integer (sign-extended to `int`) onto the operand stack.'
  },
  sipush: {
    mnemonic: 'sipush',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'byte1, byte2 (short)',
    description: 'Pushes a signed 2-byte short (sign-extended to `int`) onto the operand stack.'
  },
  ldc: {
    mnemonic: 'ldc',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'index8 (Constant Pool)',
    description: 'Pushes a constant (int, float, String, Class, MethodType, or MethodHandle) from the Constant Pool using an 8-bit index.'
  },
  ldc_w: {
    mnemonic: 'ldc_w',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'index16 (Constant Pool)',
    description: 'Pushes a constant from the Constant Pool using a 16-bit wide index.'
  },
  ldc2_w: {
    mnemonic: 'ldc2_w',
    category: 'Constants',
    stack: '... → ..., value (2 slots)',
    operands: 'index16 (Constant Pool)',
    description: 'Pushes a `long` or `double` constant (2 slots) from the Constant Pool using a 16-bit wide index.'
  },

  // Loads
  iload: { mnemonic: 'iload', category: 'Loads', stack: '... → ..., value', operands: 'index', description: 'Loads an `int` from the local variable specified by index onto the stack.' },
  iload_0: { mnemonic: 'iload_0', category: 'Loads', stack: '... → ..., value', description: 'Loads an `int` from local variable 0.' },
  iload_1: { mnemonic: 'iload_1', category: 'Loads', stack: '... → ..., value', description: 'Loads an `int` from local variable 1.' },
  iload_2: { mnemonic: 'iload_2', category: 'Loads', stack: '... → ..., value', description: 'Loads an `int` from local variable 2.' },
  iload_3: { mnemonic: 'iload_3', category: 'Loads', stack: '... → ..., value', description: 'Loads an `int` from local variable 3.' },
  lload: { mnemonic: 'lload', category: 'Loads', stack: '... → ..., value (2 slots)', operands: 'index', description: 'Loads a `long` from the local variable specified by index.' },
  lload_0: { mnemonic: 'lload_0', category: 'Loads', stack: '... → ..., value', description: 'Loads a `long` from local variable 0.' },
  lload_1: { mnemonic: 'lload_1', category: 'Loads', stack: '... → ..., value', description: 'Loads a `long` from local variable 1.' },
  lload_2: { mnemonic: 'lload_2', category: 'Loads', stack: '... → ..., value', description: 'Loads a `long` from local variable 2.' },
  lload_3: { mnemonic: 'lload_3', category: 'Loads', stack: '... → ..., value', description: 'Loads a `long` from local variable 3.' },
  fload: { mnemonic: 'fload', category: 'Loads', stack: '... → ..., value', operands: 'index', description: 'Loads a `float` from the local variable specified by index.' },
  fload_0: { mnemonic: 'fload_0', category: 'Loads', stack: '... → ..., value', description: 'Loads a `float` from local variable 0.' },
  fload_1: { mnemonic: 'fload_1', category: 'Loads', stack: '... → ..., value', description: 'Loads a `float` from local variable 1.' },
  fload_2: { mnemonic: 'fload_2', category: 'Loads', stack: '... → ..., value', description: 'Loads a `float` from local variable 2.' },
  fload_3: { mnemonic: 'fload_3', category: 'Loads', stack: '... → ..., value', description: 'Loads a `float` from local variable 3.' },
  dload: { mnemonic: 'dload', category: 'Loads', stack: '... → ..., value (2 slots)', operands: 'index', description: 'Loads a `double` from the local variable specified by index.' },
  dload_0: { mnemonic: 'dload_0', category: 'Loads', stack: '... → ..., value', description: 'Loads a `double` from local variable 0.' },
  dload_1: { mnemonic: 'dload_1', category: 'Loads', stack: '... → ..., value', description: 'Loads a `double` from local variable 1.' },
  dload_2: { mnemonic: 'dload_2', category: 'Loads', stack: '... → ..., value', description: 'Loads a `double` from local variable 2.' },
  dload_3: { mnemonic: 'dload_3', category: 'Loads', stack: '... → ..., value', description: 'Loads a `double` from local variable 3.' },
  aload: { mnemonic: 'aload', category: 'Loads', stack: '... → ..., objectref', operands: 'index', description: 'Loads an object reference from the local variable specified by index.' },
  aload_0: { mnemonic: 'aload_0', category: 'Loads', stack: '... → ..., objectref', description: 'Loads an object reference from local variable 0 (typically `this` in instance methods).' },
  aload_1: { mnemonic: 'aload_1', category: 'Loads', stack: '... → ..., objectref', description: 'Loads an object reference from local variable 1.' },
  aload_2: { mnemonic: 'aload_2', category: 'Loads', stack: '... → ..., objectref', description: 'Loads an object reference from local variable 2.' },
  aload_3: { mnemonic: 'aload_3', category: 'Loads', stack: '... → ..., objectref', description: 'Loads an object reference from local variable 3.' },

  // Array loads
  iaload: { mnemonic: 'iaload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Loads an `int` from an array component.' },
  laload: { mnemonic: 'laload', category: 'Arrays', stack: '..., arrayref, index → ..., value (2 slots)', description: 'Loads a `long` from an array component.' },
  faload: { mnemonic: 'faload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Loads a `float` from an array component.' },
  daload: { mnemonic: 'daload', category: 'Arrays', stack: '..., arrayref, index → ..., value (2 slots)', description: 'Loads a `double` from an array component.' },
  aaload: { mnemonic: 'aaload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Loads an object reference from an array of references.' },
  baload: { mnemonic: 'baload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Loads a `byte` or `boolean` from an array.' },
  caload: { mnemonic: 'caload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Loads a `char` from an array.' },
  saload: { mnemonic: 'saload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Loads a `short` from an array.' },

  // Stores
  istore: { mnemonic: 'istore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stores an `int` into the specified local variable.' },
  istore_0: { mnemonic: 'istore_0', category: 'Stores', stack: '..., value → ...', description: 'Stores an `int` into local variable 0.' },
  istore_1: { mnemonic: 'istore_1', category: 'Stores', stack: '..., value → ...', description: 'Stores an `int` into local variable 1.' },
  istore_2: { mnemonic: 'istore_2', category: 'Stores', stack: '..., value → ...', description: 'Stores an `int` into local variable 2.' },
  istore_3: { mnemonic: 'istore_3', category: 'Stores', stack: '..., value → ...', description: 'Stores an `int` into local variable 3.' },
  lstore: { mnemonic: 'lstore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stores a `long` into the specified local variable.' },
  lstore_0: { mnemonic: 'lstore_0', category: 'Stores', stack: '..., value → ...', description: 'Stores a `long` into local variable 0.' },
  lstore_1: { mnemonic: 'lstore_1', category: 'Stores', stack: '..., value → ...', description: 'Stores a `long` into local variable 1.' },
  lstore_2: { mnemonic: 'lstore_2', category: 'Stores', stack: '..., value → ...', description: 'Stores a `long` into local variable 2.' },
  lstore_3: { mnemonic: 'lstore_3', category: 'Stores', stack: '..., value → ...', description: 'Stores a `long` into local variable 3.' },
  fstore: { mnemonic: 'fstore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stores a `float` into the specified local variable.' },
  fstore_0: { mnemonic: 'fstore_0', category: 'Stores', stack: '..., value → ...', description: 'Stores a `float` into local variable 0.' },
  fstore_1: { mnemonic: 'fstore_1', category: 'Stores', stack: '..., value → ...', description: 'Stores a `float` into local variable 1.' },
  fstore_2: { mnemonic: 'fstore_2', category: 'Stores', stack: '..., value → ...', description: 'Stores a `float` into local variable 2.' },
  fstore_3: { mnemonic: 'fstore_3', category: 'Stores', stack: '..., value → ...', description: 'Stores a `float` into local variable 3.' },
  dstore: { mnemonic: 'dstore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stores a `double` into the specified local variable.' },
  dstore_0: { mnemonic: 'dstore_0', category: 'Stores', stack: '..., value → ...', description: 'Stores a `double` into local variable 0.' },
  dstore_1: { mnemonic: 'dstore_1', category: 'Stores', stack: '..., value → ...', description: 'Stores a `double` into local variable 1.' },
  dstore_2: { mnemonic: 'dstore_2', category: 'Stores', stack: '..., value → ...', description: 'Stores a `double` into local variable 2.' },
  dstore_3: { mnemonic: 'dstore_3', category: 'Stores', stack: '..., value → ...', description: 'Stores a `double` into local variable 3.' },
  astore: { mnemonic: 'astore', category: 'Stores', stack: '..., objectref → ...', operands: 'index', description: 'Stores an object reference into the specified local variable.' },
  astore_0: { mnemonic: 'astore_0', category: 'Stores', stack: '..., objectref → ...', description: 'Stores an object reference into local variable 0.' },
  astore_1: { mnemonic: 'astore_1', category: 'Stores', stack: '..., objectref → ...', description: 'Stores an object reference into local variable 1.' },
  astore_2: { mnemonic: 'astore_2', category: 'Stores', stack: '..., objectref → ...', description: 'Stores an object reference into local variable 2.' },
  astore_3: { mnemonic: 'astore_3', category: 'Stores', stack: '..., objectref → ...', description: 'Stores an object reference into local variable 3.' },

  // Array stores
  iastore: { mnemonic: 'iastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores an `int` into an array component.' },
  lastore: { mnemonic: 'lastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores a `long` into an array component.' },
  fastore: { mnemonic: 'fastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores a `float` into an array component.' },
  dastore: { mnemonic: 'dastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores a `double` into an array component.' },
  aastore: { mnemonic: 'aastore', category: 'Arrays', stack: '..., arrayref, index, objectref → ...', description: 'Stores an object reference into an array component.' },
  bastore: { mnemonic: 'bastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores a `byte` or `boolean` into an array component.' },
  castore: { mnemonic: 'castore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores a `char` into an array component.' },
  sastore: { mnemonic: 'sastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stores a `short` into an array component.' },

  // Stack management
  pop: { mnemonic: 'pop', category: 'Stack', stack: '..., value → ...', description: 'Pops the top operand stack value (1-slot value).' },
  pop2: { mnemonic: 'pop2', category: 'Stack', stack: '..., val2, val1 → ... or ..., val(2-slot) → ...', description: 'Pops the top one (if 2-slot value) or two (if 1-slot values) operand stack values.' },
  dup: { mnemonic: 'dup', category: 'Stack', stack: '..., value → ..., value, value', description: 'Duplicates the top operand stack value.' },
  dup_x1: { mnemonic: 'dup_x1', category: 'Stack', stack: '..., val2, val1 → ..., val1, val2, val1', description: 'Duplicates the top operand stack value and inserts it two values down.' },
  dup_x2: { mnemonic: 'dup_x2', category: 'Stack', stack: '..., val3, val2, val1 → ..., val1, val3, val2, val1', description: 'Duplicates the top operand stack value and inserts it two or three values down.' },
  dup2: { mnemonic: 'dup2', category: 'Stack', stack: '..., val2, val1 → ..., val2, val1, val2, val1', description: 'Duplicates the top one (if 2-slot value) or two (if 1-slot values) operand stack values.' },
  dup2_x1: { mnemonic: 'dup2_x1', category: 'Stack', stack: '..., val3, val2, val1 → ..., val2, val1, val3, val2, val1', description: 'Duplicates the top two values and inserts them three values down.' },
  dup2_x2: { mnemonic: 'dup2_x2', category: 'Stack', stack: '..., val4, val3, val2, val1 → ..., val2, val1, val4, val3, val2, val1', description: 'Duplicates the top two values and inserts them four values down.' },
  swap: { mnemonic: 'swap', category: 'Stack', stack: '..., val2, val1 → ..., val1, val2', description: 'Swaps the two top operand stack values (1-slot each).' },

  // Arithmetic
  iadd: { mnemonic: 'iadd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Adds two `int` values (`val1 + val2`).' },
  ladd: { mnemonic: 'ladd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Adds two `long` values (`val1 + val2`).' },
  fadd: { mnemonic: 'fadd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Adds two `float` values (`val1 + val2`).' },
  dadd: { mnemonic: 'dadd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Adds two `double` values (`val1 + val2`).' },
  isub: { mnemonic: 'isub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Subtracts two `int` values (`val1 - val2`).' },
  lsub: { mnemonic: 'lsub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Subtracts two `long` values (`val1 - val2`).' },
  fsub: { mnemonic: 'fsub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Subtracts two `float` values (`val1 - val2`).' },
  dsub: { mnemonic: 'dsub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Subtracts two `double` values (`val1 - val2`).' },
  imul: { mnemonic: 'imul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplies two `int` values (`val1 * val2`).' },
  lmul: { mnemonic: 'lmul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplies two `long` values (`val1 * val2`).' },
  fmul: { mnemonic: 'fmul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplies two `float` values (`val1 * val2`).' },
  dmul: { mnemonic: 'dmul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplies two `double` values (`val1 * val2`).' },
  idiv: { mnemonic: 'idiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Divides two `int` values (`val1 / val2`). Throws `ArithmeticException` if division by zero.' },
  ldiv: { mnemonic: 'ldiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Divides two `long` values (`val1 / val2`). Throws `ArithmeticException` if division by zero.' },
  fdiv: { mnemonic: 'fdiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Divides two `float` values (`val1 / val2`).' },
  ddiv: { mnemonic: 'ddiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Divides two `double` values (`val1 / val2`).' },
  irem: { mnemonic: 'irem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Computes the remainder of `int` division (`val1 % val2`).' },
  lrem: { mnemonic: 'lrem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Computes the remainder of `long` division (`val1 % val2`).' },
  frem: { mnemonic: 'frem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Computes the remainder of `float` division (`val1 % val2`).' },
  drem: { mnemonic: 'drem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Computes the remainder of `double` division (`val1 % val2`).' },
  ineg: { mnemonic: 'ineg', category: 'Math', stack: '..., val → ..., -val', description: 'Negates an `int` value (`-val`).' },
  lneg: { mnemonic: 'lneg', category: 'Math', stack: '..., val → ..., -val', description: 'Negates a `long` value (`-val`).' },
  fneg: { mnemonic: 'fneg', category: 'Math', stack: '..., val → ..., -val', description: 'Negates a `float` value (`-val`).' },
  dneg: { mnemonic: 'dneg', category: 'Math', stack: '..., val → ..., -val', description: 'Negates a `double` value (`-val`).' },

  // Bitwise & Shift
  ishl: { mnemonic: 'ishl', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Shifts an `int` left by the amount specified by the lower 5 bits of `val2` (`val1 << (val2 & 0x1f)`).' },
  lshl: { mnemonic: 'lshl', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Shifts a `long` left by the amount specified by the lower 6 bits of `val2` (`val1 << (val2 & 0x3f)`).' },
  ishr: { mnemonic: 'ishr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Arithmetic shift right (sign-preserving) of an `int` (`val1 >> (val2 & 0x1f)`).' },
  lshr: { mnemonic: 'lshr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Arithmetic shift right (sign-preserving) of a `long` (`val1 >> (val2 & 0x3f)`).' },
  iushr: { mnemonic: 'iushr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Logical shift right (zero-extended) of an `int` (`val1 >>> (val2 & 0x1f)`).' },
  lushr: { mnemonic: 'lushr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Logical shift right (zero-extended) of a `long` (`val1 >>> (val2 & 0x3f)`).' },
  iand: { mnemonic: 'iand', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Bitwise boolean AND of two `int` values (`val1 & val2`).' },
  land: { mnemonic: 'land', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Bitwise boolean AND of two `long` values (`val1 & val2`).' },
  ior: { mnemonic: 'ior', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Bitwise boolean OR of two `int` values (`val1 | val2`).' },
  lor: { mnemonic: 'lor', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Bitwise boolean OR of two `long` values (`val1 | val2`).' },
  ixor: { mnemonic: 'ixor', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Bitwise boolean XOR of two `int` values (`val1 ^ val2`).' },
  lxor: { mnemonic: 'lxor', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Bitwise boolean XOR of two `long` values (`val1 ^ val2`).' },
  iinc: { mnemonic: 'iinc', category: 'Math', stack: '[no change]', operands: 'index, const', description: 'Increments a local variable directly by a constant signed byte value without using the stack.' },

  // Conversions
  i2l: { mnemonic: 'i2l', category: 'Conversions', stack: '..., int → ..., long', description: 'Converts an `int` to a `long` (sign extension).' },
  i2f: { mnemonic: 'i2f', category: 'Conversions', stack: '..., int → ..., float', description: 'Converts an `int` to a `float`.' },
  i2d: { mnemonic: 'i2d', category: 'Conversions', stack: '..., int → ..., double', description: 'Converts an `int` to a `double`.' },
  l2i: { mnemonic: 'l2i', category: 'Conversions', stack: '..., long → ..., int', description: 'Converts a `long` to an `int` (truncation).' },
  l2f: { mnemonic: 'l2f', category: 'Conversions', stack: '..., long → ..., float', description: 'Converts a `long` to a `float`.' },
  l2d: { mnemonic: 'l2d', category: 'Conversions', stack: '..., long → ..., double', description: 'Converts a `long` to a `double`.' },
  f2i: { mnemonic: 'f2i', category: 'Conversions', stack: '..., float → ..., int', description: 'Converts a `float` to an `int`.' },
  f2l: { mnemonic: 'f2l', category: 'Conversions', stack: '..., float → ..., long', description: 'Converts a `float` to a `long`.' },
  f2d: { mnemonic: 'f2d', category: 'Conversions', stack: '..., float → ..., double', description: 'Converts a `float` to a `double`.' },
  d2i: { mnemonic: 'd2i', category: 'Conversions', stack: '..., double → ..., int', description: 'Converts a `double` to an `int`.' },
  d2l: { mnemonic: 'd2l', category: 'Conversions', stack: '..., double → ..., long', description: 'Converts a `double` to a `long`.' },
  d2f: { mnemonic: 'd2f', category: 'Conversions', stack: '..., double → ..., float', description: 'Converts a `double` to a `float`.' },
  i2b: { mnemonic: 'i2b', category: 'Conversions', stack: '..., int → ..., byte', description: 'Truncates an `int` into a signed `byte`.' },
  i2c: { mnemonic: 'i2c', category: 'Conversions', stack: '..., int → ..., char', description: 'Truncates an `int` into an unsigned 16-bit `char`.' },
  i2s: { mnemonic: 'i2s', category: 'Conversions', stack: '..., int → ..., short', description: 'Truncates an `int` into a signed 16-bit `short`.' },

  // Comparisons
  lcmp: { mnemonic: 'lcmp', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compares two `long` values and pushes `-1`, `0`, or `1`.' },
  fcmpl: { mnemonic: 'fcmpl', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compares two `float` values (pushes `-1` if either value is NaN).' },
  fcmpg: { mnemonic: 'fcmpg', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compares two `float` values (pushes `1` if either value is NaN).' },
  dcmpl: { mnemonic: 'dcmpl', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compares two `double` values (pushes `-1` if either value is NaN).' },
  dcmpg: { mnemonic: 'dcmpg', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compares two `double` values (pushes `1` if either value is NaN).' },
  ifeq: { mnemonic: 'ifeq', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if `int` value equals 0 (`value == 0`).' },
  ifne: { mnemonic: 'ifne', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if `int` value is not equal to 0 (`value != 0`).' },
  iflt: { mnemonic: 'iflt', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if `int` value is strictly less than 0 (`value < 0`).' },
  ifge: { mnemonic: 'ifge', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if `int` value is greater than or equal to 0 (`value >= 0`).' },
  ifgt: { mnemonic: 'ifgt', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if `int` value is strictly greater than 0 (`value > 0`).' },
  ifle: { mnemonic: 'ifle', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if `int` value is less than or equal to 0 (`value <= 0`).' },
  if_icmpeq: { mnemonic: 'if_icmpeq', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Branches if two `int` values are equal (`val1 == val2`).' },
  if_icmpne: { mnemonic: 'if_icmpne', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Branches if two `int` values are not equal (`val1 != val2`).' },
  if_icmplt: { mnemonic: 'if_icmplt', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Branches if `val1 < val2`.' },
  if_icmpge: { mnemonic: 'if_icmpge', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Branches if `val1 >= val2`.' },
  if_icmpgt: { mnemonic: 'if_icmpgt', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Branches if `val1 > val2`.' },
  if_icmple: { mnemonic: 'if_icmple', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Branches if `val1 <= val2`.' },
  if_acmpeq: { mnemonic: 'if_acmpeq', category: 'Control', stack: '..., ref1, ref2 → ...', operands: 'branchoffset', description: 'Branches if two object references are identical (`ref1 == ref2`).' },
  if_acmpne: { mnemonic: 'if_acmpne', category: 'Control', stack: '..., ref1, ref2 → ...', operands: 'branchoffset', description: 'Branches if two object references are not identical (`ref1 != ref2`).' },
  ifnull: { mnemonic: 'ifnull', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if object reference is `null`.' },
  ifnonnull: { mnemonic: 'ifnonnull', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Branches if object reference is not `null`.' },

  // Jumps & Switches
  goto: { mnemonic: 'goto', category: 'Control', stack: '[no change]', operands: 'branchoffset', description: 'Unconditional branch to instruction at branchoffset.' },
  goto_w: { mnemonic: 'goto_w', category: 'Control', stack: '[no change]', operands: 'branchoffset (32-bit)', description: 'Unconditional branch to instruction at wide 32-bit offset.' },
  tableswitch: { mnemonic: 'tableswitch', category: 'Control', stack: '..., index → ...', description: 'Table-based jump for contiguous switch index values (O(1) execution).' },
  lookupswitch: { mnemonic: 'lookupswitch', category: 'Control', stack: '..., key → ...', description: 'Key-match jump for non-contiguous switch cases (binary search O(log N)).' },

  // Returns
  ireturn: { mnemonic: 'ireturn', category: 'Returns', stack: '..., value → [empty]', description: 'Returns an `int` (`boolean`, `byte`, `char`, or `short`) from the current method.' },
  lreturn: { mnemonic: 'lreturn', category: 'Returns', stack: '..., value → [empty]', description: 'Returns a `long` from the current method.' },
  freturn: { mnemonic: 'freturn', category: 'Returns', stack: '..., value → [empty]', description: 'Returns a `float` from the current method.' },
  dreturn: { mnemonic: 'dreturn', category: 'Returns', stack: '..., value → [empty]', description: 'Returns a `double` from the current method.' },
  areturn: { mnemonic: 'areturn', category: 'Returns', stack: '..., objectref → [empty]', description: 'Returns an object reference from the current method.' },
  return: { mnemonic: 'return', category: 'Returns', stack: '... → [empty]', description: 'Returns `void` from the current method.' },

  // References & Method Invocations
  getstatic: {
    mnemonic: 'getstatic',
    category: 'References',
    stack: '... → ..., value',
    operands: 'index16 (Fieldref)',
    description: 'Fetches the value of a static field from a class via Constant Pool index.'
  },
  putstatic: {
    mnemonic: 'putstatic',
    category: 'References',
    stack: '..., value → ...',
    operands: 'index16 (Fieldref)',
    description: 'Sets the value of a static field in a class.'
  },
  getfield: {
    mnemonic: 'getfield',
    category: 'References',
    stack: '..., objectref → ..., value',
    operands: 'index16 (Fieldref)',
    description: 'Fetches a field value from an instance of an object (`objectref`).'
  },
  putfield: {
    mnemonic: 'putfield',
    category: 'References',
    stack: '..., objectref, value → ...',
    operands: 'index16 (Fieldref)',
    description: 'Sets a field value in an instance of an object (`objectref`).'
  },
  invokevirtual: {
    mnemonic: 'invokevirtual',
    category: 'Methods',
    stack: '..., objectref, [arg1, arg2 ...] → ...',
    operands: 'index16 (Methodref)',
    description: 'Invokes an instance method with standard polymorphic dispatch (dynamic binding based on runtime class).'
  },
  invokespecial: {
    mnemonic: 'invokespecial',
    category: 'Methods',
    stack: '..., objectref, [arg1, arg2 ...] → ...',
    operands: 'index16 (Methodref)',
    description: 'Invokes an instance method non-polymorphically: instance initializer (`<init>`), private method, or superclass method (`super.method()`).'
  },
  invokestatic: {
    mnemonic: 'invokestatic',
    category: 'Methods',
    stack: '..., [arg1, arg2 ...] → ...',
    operands: 'index16 (Methodref)',
    description: 'Invokes a static class method (no target `objectref` required).'
  },
  invokeinterface: {
    mnemonic: 'invokeinterface',
    category: 'Methods',
    stack: '..., objectref, [arg1, arg2 ...] → ...',
    operands: 'index16 (InterfaceMethodref), count, 0',
    description: 'Invokes an interface method on `objectref`.'
  },
  invokedynamic: {
    mnemonic: 'invokedynamic',
    category: 'Methods',
    stack: '..., [arg1, arg2 ...] → ...',
    operands: 'index16 (InvokeDynamic), 0, 0',
    description: 'Invokes a dynamic call site linked by a bootstrap method (essential for lambdas, records, string concatenation).'
  },

  // Object & Array creation
  new: {
    mnemonic: 'new',
    category: 'References',
    stack: '... → ..., objectref',
    operands: 'index16 (Class)',
    description: 'Allocates memory for a new object and pushes an uninitialized object reference.'
  },
  newarray: {
    mnemonic: 'newarray',
    category: 'Arrays',
    stack: '..., count → ..., arrayref',
    operands: 'atype',
    description: 'Allocates a new array of primitive types (`int`, `float`, `byte`, `boolean`, etc.) of length `count`.'
  },
  anewarray: {
    mnemonic: 'anewarray',
    category: 'Arrays',
    stack: '..., count → ..., arrayref',
    operands: 'index16 (Class)',
    description: 'Allocates a new array of object references of length `count`.'
  },
  arraylength: {
    mnemonic: 'arraylength',
    category: 'Arrays',
    stack: '..., arrayref → ..., length',
    description: 'Pushes the length of an array onto the stack.'
  },
  athrow: {
    mnemonic: 'athrow',
    category: 'Exceptions',
    stack: '..., objectref → [empty], objectref',
    description: 'Throws an exception or error represented by `objectref`.'
  },
  checkcast: {
    mnemonic: 'checkcast',
    category: 'References',
    stack: '..., objectref → ..., objectref',
    operands: 'index16 (Class)',
    description: 'Checks whether `objectref` is of the specified type. Throws `ClassCastException` on failure.'
  },
  instanceof: {
    mnemonic: 'instanceof',
    category: 'References',
    stack: '..., objectref → ..., result (0 or 1)',
    operands: 'index16 (Class)',
    description: 'Determines whether an object is an instance of a given class or interface.'
  },
  monitorenter: {
    mnemonic: 'monitorenter',
    category: 'Concurrency',
    stack: '..., objectref → ...',
    description: 'Acquires the synchronization monitor of the target object (`synchronized` block).'
  },
  monitorexit: {
    mnemonic: 'monitorexit',
    category: 'Concurrency',
    stack: '..., objectref → ...',
    description: 'Releases the synchronization monitor of the target object.'
  },
  multianewarray: {
    mnemonic: 'multianewarray',
    category: 'Arrays',
    stack: '..., count1, [count2 ...] → ..., arrayref',
    operands: 'index16 (Class), dimensions',
    description: 'Allocates a new multidimensional array.'
  }
};
