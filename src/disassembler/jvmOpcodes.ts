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
    description: 'Ne fait rien (No operation).'
  },
  aconst_null: {
    mnemonic: 'aconst_null',
    category: 'Constants',
    stack: '... → ..., null',
    description: 'Empile la référence `null` sur la pile des opérandes.'
  },
  iconst_m1: {
    mnemonic: 'iconst_m1',
    category: 'Constants',
    stack: '... → ..., -1',
    description: 'Empile la constante entière `-1` sur la pile.'
  },
  iconst_0: { mnemonic: 'iconst_0', category: 'Constants', stack: '... → ..., 0', description: 'Empile la constante entière `0` sur la pile.' },
  iconst_1: { mnemonic: 'iconst_1', category: 'Constants', stack: '... → ..., 1', description: 'Empile la constante entière `1` sur la pile.' },
  iconst_2: { mnemonic: 'iconst_2', category: 'Constants', stack: '... → ..., 2', description: 'Empile la constante entière `2` sur la pile.' },
  iconst_3: { mnemonic: 'iconst_3', category: 'Constants', stack: '... → ..., 3', description: 'Empile la constante entière `3` sur la pile.' },
  iconst_4: { mnemonic: 'iconst_4', category: 'Constants', stack: '... → ..., 4', description: 'Empile la constante entière `4` sur la pile.' },
  iconst_5: { mnemonic: 'iconst_5', category: 'Constants', stack: '... → ..., 5', description: 'Empile la constante entière `5` sur la pile.' },
  lconst_0: { mnemonic: 'lconst_0', category: 'Constants', stack: '... → ..., 0L', description: 'Empile la constante long `0L` (2 slots).' },
  lconst_1: { mnemonic: 'lconst_1', category: 'Constants', stack: '... → ..., 1L', description: 'Empile la constante long `1L` (2 slots).' },
  fconst_0: { mnemonic: 'fconst_0', category: 'Constants', stack: '... → ..., 0.0f', description: 'Empile la constante float `0.0f`.' },
  fconst_1: { mnemonic: 'fconst_1', category: 'Constants', stack: '... → ..., 1.0f', description: 'Empile la constante float `1.0f`.' },
  fconst_2: { mnemonic: 'fconst_2', category: 'Constants', stack: '... → ..., 2.0f', description: 'Empile la constante float `2.0f`.' },
  dconst_0: { mnemonic: 'dconst_0', category: 'Constants', stack: '... → ..., 0.0d', description: 'Empile la constante double `0.0d` (2 slots).' },
  dconst_1: { mnemonic: 'dconst_1', category: 'Constants', stack: '... → ..., 1.0d', description: 'Empile la constante double `1.0d` (2 slots).' },
  bipush: {
    mnemonic: 'bipush',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'byte',
    description: 'Empile un entier signé sur 1 octet (byte étendu en int) sur la pile.'
  },
  sipush: {
    mnemonic: 'sipush',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'byte1, byte2 (short)',
    description: 'Empile un entier signé sur 2 octets (short étendu en int) sur la pile.'
  },
  ldc: {
    mnemonic: 'ldc',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'index8 (Constant Pool)',
    description: 'Charge une constante (int, float, String, Class, MethodType ou MethodHandle) depuis le Constant Pool sur 8 bits.'
  },
  ldc_w: {
    mnemonic: 'ldc_w',
    category: 'Constants',
    stack: '... → ..., value',
    operands: 'index16 (Constant Pool)',
    description: 'Charge une constante depuis le Constant Pool en utilisant un index large sur 16 bits.'
  },
  ldc2_w: {
    mnemonic: 'ldc2_w',
    category: 'Constants',
    stack: '... → ..., value (2 slots)',
    operands: 'index16 (Constant Pool)',
    description: 'Charge une constante de type `long` ou `double` (2 slots) depuis le Constant Pool.'
  },

  // Loads
  iload: { mnemonic: 'iload', category: 'Loads', stack: '... → ..., value', operands: 'index', description: 'Charge un entier (int) depuis la variable locale d’index spécifié.' },
  iload_0: { mnemonic: 'iload_0', category: 'Loads', stack: '... → ..., value', description: 'Charge un int depuis la variable locale 0.' },
  iload_1: { mnemonic: 'iload_1', category: 'Loads', stack: '... → ..., value', description: 'Charge un int depuis la variable locale 1.' },
  iload_2: { mnemonic: 'iload_2', category: 'Loads', stack: '... → ..., value', description: 'Charge un int depuis la variable locale 2.' },
  iload_3: { mnemonic: 'iload_3', category: 'Loads', stack: '... → ..., value', description: 'Charge un int depuis la variable locale 3.' },
  lload: { mnemonic: 'lload', category: 'Loads', stack: '... → ..., value (2 slots)', operands: 'index', description: 'Charge un `long` depuis la variable locale spécifiée.' },
  lload_0: { mnemonic: 'lload_0', category: 'Loads', stack: '... → ..., value', description: 'Charge un long depuis la variable locale 0.' },
  lload_1: { mnemonic: 'lload_1', category: 'Loads', stack: '... → ..., value', description: 'Charge un long depuis la variable locale 1.' },
  lload_2: { mnemonic: 'lload_2', category: 'Loads', stack: '... → ..., value', description: 'Charge un long depuis la variable locale 2.' },
  lload_3: { mnemonic: 'lload_3', category: 'Loads', stack: '... → ..., value', description: 'Charge un long depuis la variable locale 3.' },
  fload: { mnemonic: 'fload', category: 'Loads', stack: '... → ..., value', operands: 'index', description: 'Charge un `float` depuis la variable locale spécifiée.' },
  fload_0: { mnemonic: 'fload_0', category: 'Loads', stack: '... → ..., value', description: 'Charge un float depuis la variable locale 0.' },
  fload_1: { mnemonic: 'fload_1', category: 'Loads', stack: '... → ..., value', description: 'Charge un float depuis la variable locale 1.' },
  fload_2: { mnemonic: 'fload_2', category: 'Loads', stack: '... → ..., value', description: 'Charge un float depuis la variable locale 2.' },
  fload_3: { mnemonic: 'fload_3', category: 'Loads', stack: '... → ..., value', description: 'Charge un float depuis la variable locale 3.' },
  dload: { mnemonic: 'dload', category: 'Loads', stack: '... → ..., value (2 slots)', operands: 'index', description: 'Charge un `double` depuis la variable locale spécifiée.' },
  dload_0: { mnemonic: 'dload_0', category: 'Loads', stack: '... → ..., value', description: 'Charge un double depuis la variable locale 0.' },
  dload_1: { mnemonic: 'dload_1', category: 'Loads', stack: '... → ..., value', description: 'Charge un double depuis la variable locale 1.' },
  dload_2: { mnemonic: 'dload_2', category: 'Loads', stack: '... → ..., value', description: 'Charge un double depuis la variable locale 2.' },
  dload_3: { mnemonic: 'dload_3', category: 'Loads', stack: '... → ..., value', description: 'Charge un double depuis la variable locale 3.' },
  aload: { mnemonic: 'aload', category: 'Loads', stack: '... → ..., objectref', operands: 'index', description: 'Charge une référence d’objet depuis la variable locale d’index spécifié.' },
  aload_0: { mnemonic: 'aload_0', category: 'Loads', stack: '... → ..., objectref', description: 'Charge la référence de la variable locale 0 (généralement `this` dans une méthode d’instance).' },
  aload_1: { mnemonic: 'aload_1', category: 'Loads', stack: '... → ..., objectref', description: 'Charge la référence de la variable locale 1.' },
  aload_2: { mnemonic: 'aload_2', category: 'Loads', stack: '... → ..., objectref', description: 'Charge la référence de la variable locale 2.' },
  aload_3: { mnemonic: 'aload_3', category: 'Loads', stack: '... → ..., objectref', description: 'Charge la référence de la variable locale 3.' },

  // Array loads
  iaload: { mnemonic: 'iaload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Charge un int depuis un tableau.' },
  laload: { mnemonic: 'laload', category: 'Arrays', stack: '..., arrayref, index → ..., value (2 slots)', description: 'Charge un long depuis un tableau.' },
  faload: { mnemonic: 'faload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Charge un float depuis un tableau.' },
  daload: { mnemonic: 'daload', category: 'Arrays', stack: '..., arrayref, index → ..., value (2 slots)', description: 'Charge un double depuis un tableau.' },
  aaload: { mnemonic: 'aaload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Charge une référence d’objet depuis un tableau de références.' },
  baload: { mnemonic: 'baload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Charge un byte ou boolean depuis un tableau.' },
  caload: { mnemonic: 'caload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Charge un char depuis un tableau.' },
  saload: { mnemonic: 'saload', category: 'Arrays', stack: '..., arrayref, index → ..., value', description: 'Charge un short depuis un tableau.' },

  // Stores
  istore: { mnemonic: 'istore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stocke un int dans la variable locale spécifiée.' },
  istore_0: { mnemonic: 'istore_0', category: 'Stores', stack: '..., value → ...', description: 'Stocke un int dans la variable locale 0.' },
  istore_1: { mnemonic: 'istore_1', category: 'Stores', stack: '..., value → ...', description: 'Stocke un int dans la variable locale 1.' },
  istore_2: { mnemonic: 'istore_2', category: 'Stores', stack: '..., value → ...', description: 'Stocke un int dans la variable locale 2.' },
  istore_3: { mnemonic: 'istore_3', category: 'Stores', stack: '..., value → ...', description: 'Stocke un int dans la variable locale 3.' },
  lstore: { mnemonic: 'lstore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stocke un long dans la variable locale spécifiée.' },
  lstore_0: { mnemonic: 'lstore_0', category: 'Stores', stack: '..., value → ...', description: 'Stocke un long dans la variable locale 0.' },
  lstore_1: { mnemonic: 'lstore_1', category: 'Stores', stack: '..., value → ...', description: 'Stocke un long dans la variable locale 1.' },
  lstore_2: { mnemonic: 'lstore_2', category: 'Stores', stack: '..., value → ...', description: 'Stocke un long dans la variable locale 2.' },
  lstore_3: { mnemonic: 'lstore_3', category: 'Stores', stack: '..., value → ...', description: 'Stocke un long dans la variable locale 3.' },
  fstore: { mnemonic: 'fstore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stocke un float dans la variable locale spécifiée.' },
  fstore_0: { mnemonic: 'fstore_0', category: 'Stores', stack: '..., value → ...', description: 'Stocke un float dans la variable locale 0.' },
  fstore_1: { mnemonic: 'fstore_1', category: 'Stores', stack: '..., value → ...', description: 'Stocke un float dans la variable locale 1.' },
  fstore_2: { mnemonic: 'fstore_2', category: 'Stores', stack: '..., value → ...', description: 'Stocke un float dans la variable locale 2.' },
  fstore_3: { mnemonic: 'fstore_3', category: 'Stores', stack: '..., value → ...', description: 'Stocke un float dans la variable locale 3.' },
  dstore: { mnemonic: 'dstore', category: 'Stores', stack: '..., value → ...', operands: 'index', description: 'Stocke un double dans la variable locale spécifiée.' },
  dstore_0: { mnemonic: 'dstore_0', category: 'Stores', stack: '..., value → ...', description: 'Stocke un double dans la variable locale 0.' },
  dstore_1: { mnemonic: 'dstore_1', category: 'Stores', stack: '..., value → ...', description: 'Stocke un double dans la variable locale 1.' },
  dstore_2: { mnemonic: 'dstore_2', category: 'Stores', stack: '..., value → ...', description: 'Stocke un double dans la variable locale 2.' },
  dstore_3: { mnemonic: 'dstore_3', category: 'Stores', stack: '..., value → ...', description: 'Stocke un double dans la variable locale 3.' },
  astore: { mnemonic: 'astore', category: 'Stores', stack: '..., objectref → ...', operands: 'index', description: 'Stocke une référence d’objet dans la variable locale spécifiée.' },
  astore_0: { mnemonic: 'astore_0', category: 'Stores', stack: '..., objectref → ...', description: 'Stocke une référence dans la variable locale 0.' },
  astore_1: { mnemonic: 'astore_1', category: 'Stores', stack: '..., objectref → ...', description: 'Stocke une référence dans la variable locale 1.' },
  astore_2: { mnemonic: 'astore_2', category: 'Stores', stack: '..., objectref → ...', description: 'Stocke une référence dans la variable locale 2.' },
  astore_3: { mnemonic: 'astore_3', category: 'Stores', stack: '..., objectref → ...', description: 'Stocke une référence dans la variable locale 3.' },

  // Array stores
  iastore: { mnemonic: 'iastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un int dans un élément de tableau.' },
  lastore: { mnemonic: 'lastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un long dans un élément de tableau.' },
  fastore: { mnemonic: 'fastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un float dans un élément de tableau.' },
  dastore: { mnemonic: 'dastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un double dans un élément de tableau.' },
  aastore: { mnemonic: 'aastore', category: 'Arrays', stack: '..., arrayref, index, objectref → ...', description: 'Stocke une référence d’objet dans un élément de tableau.' },
  bastore: { mnemonic: 'bastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un byte ou boolean dans un élément de tableau.' },
  castore: { mnemonic: 'castore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un char dans un élément de tableau.' },
  sastore: { mnemonic: 'sastore', category: 'Arrays', stack: '..., arrayref, index, value → ...', description: 'Stocke un short dans un élément de tableau.' },

  // Stack management
  pop: { mnemonic: 'pop', category: 'Stack', stack: '..., value → ...', description: 'Dépile le mot sommital (valeur 1-slot).' },
  pop2: { mnemonic: 'pop2', category: 'Stack', stack: '..., val2, val1 → ... ou ..., val(2-slot) → ...', description: 'Dépile les deux mots sommitaux (ou une valeur 2-slots comme long ou double).' },
  dup: { mnemonic: 'dup', category: 'Stack', stack: '..., value → ..., value, value', description: 'Duplique la valeur au sommet de la pile.' },
  dup_x1: { mnemonic: 'dup_x1', category: 'Stack', stack: '..., val2, val1 → ..., val1, val2, val1', description: 'Duplique la valeur sommitale et l’insère sous la 2ème valeur.' },
  dup_x2: { mnemonic: 'dup_x2', category: 'Stack', stack: '..., val3, val2, val1 → ..., val1, val3, val2, val1', description: 'Duplique la valeur sommitale et l’insère sous 2 ou 3 mots.' },
  dup2: { mnemonic: 'dup2', category: 'Stack', stack: '..., val2, val1 → ..., val2, val1, val2, val1', description: 'Duplique les 2 valeurs sommitales (ou 1 valeur 2-slots).' },
  dup2_x1: { mnemonic: 'dup2_x1', category: 'Stack', stack: '..., val3, val2, val1 → ..., val2, val1, val3, val2, val1', description: 'Duplique deux mots sommitaux et les insère sous le 3ème mot.' },
  dup2_x2: { mnemonic: 'dup2_x2', category: 'Stack', stack: '..., val4, val3, val2, val1 → ..., val2, val1, val4, val3, val2, val1', description: 'Duplique deux mots sommitaux et les insère sous 4 mots.' },
  swap: { mnemonic: 'swap', category: 'Stack', stack: '..., val2, val1 → ..., val1, val2', description: 'Intervertit les deux valeurs sommitales (1-slot chacune).' },

  // Arithmetic
  iadd: { mnemonic: 'iadd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Addition entière (`int + int`).' },
  ladd: { mnemonic: 'ladd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Addition de longs (`long + long`).' },
  fadd: { mnemonic: 'fadd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Addition de floats (`float + float`).' },
  dadd: { mnemonic: 'dadd', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Addition de doubles (`double + double`).' },
  isub: { mnemonic: 'isub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Soustraction entière (`val1 - val2`).' },
  lsub: { mnemonic: 'lsub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Soustraction de longs (`val1 - val2`).' },
  fsub: { mnemonic: 'fsub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Soustraction de floats (`val1 - val2`).' },
  dsub: { mnemonic: 'dsub', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Soustraction de doubles (`val1 - val2`).' },
  imul: { mnemonic: 'imul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplication entière (`val1 * val2`).' },
  lmul: { mnemonic: 'lmul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplication de longs (`val1 * val2`).' },
  fmul: { mnemonic: 'fmul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplication de floats (`val1 * val2`).' },
  dmul: { mnemonic: 'dmul', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Multiplication de doubles (`val1 * val2`).' },
  idiv: { mnemonic: 'idiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Division entière (`val1 / val2`). Lève `ArithmeticException` si division par 0.' },
  ldiv: { mnemonic: 'ldiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Division de longs (`val1 / val2`).' },
  fdiv: { mnemonic: 'fdiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Division de floats (`val1 / val2`).' },
  ddiv: { mnemonic: 'ddiv', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Division de doubles (`val1 / val2`).' },
  irem: { mnemonic: 'irem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Modulo entier (`val1 % val2`).' },
  lrem: { mnemonic: 'lrem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Modulo de longs (`val1 % val2`).' },
  frem: { mnemonic: 'frem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Modulo de floats (`val1 % val2`).' },
  drem: { mnemonic: 'drem', category: 'Math', stack: '..., val1, val2 → ..., result', description: 'Modulo de doubles (`val1 % val2`).' },
  ineg: { mnemonic: 'ineg', category: 'Math', stack: '..., val → ..., -val', description: 'Négation d’un entier (`-val`).' },
  lneg: { mnemonic: 'lneg', category: 'Math', stack: '..., val → ..., -val', description: 'Négation d’un long (`-val`).' },
  fneg: { mnemonic: 'fneg', category: 'Math', stack: '..., val → ..., -val', description: 'Négation d’un float (`-val`).' },
  dneg: { mnemonic: 'dneg', category: 'Math', stack: '..., val → ..., -val', description: 'Négation d’un double (`-val`).' },

  // Bitwise & Shift
  ishl: { mnemonic: 'ishl', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Décalage binaire arithmétique vers la gauche (`val1 << (val2 & 0x1f)`).' },
  lshl: { mnemonic: 'lshl', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Décalage binaire vers la gauche pour long (`val1 << (val2 & 0x3f)`).' },
  ishr: { mnemonic: 'ishr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Décalage binaire arithmétique vers la droite avec signe (`val1 >> val2`).' },
  lshr: { mnemonic: 'lshr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Décalage arithmétique vers la droite pour long (`val1 >> val2`).' },
  iushr: { mnemonic: 'iushr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Décalage logique sans signe vers la droite (`val1 >>> val2`).' },
  lushr: { mnemonic: 'lushr', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'Décalage logique sans signe vers la droite pour long (`val1 >>> val2`).' },
  iand: { mnemonic: 'iand', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'ET binaire logique (`val1 & val2`).' },
  land: { mnemonic: 'land', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'ET binaire logique pour long (`val1 & val2`).' },
  ior: { mnemonic: 'ior', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'OU binaire logique (`val1 | val2`).' },
  lor: { mnemonic: 'lor', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'OU binaire logique pour long (`val1 | val2`).' },
  ixor: { mnemonic: 'ixor', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'OU exclusif binaire (XOR) (`val1 ^ val2`).' },
  lxor: { mnemonic: 'lxor', category: 'Bitwise', stack: '..., val1, val2 → ..., result', description: 'OU exclusif binaire pour long (`val1 ^ val2`).' },
  iinc: { mnemonic: 'iinc', category: 'Math', stack: '[no change]', operands: 'index, const', description: 'Incrémente directement une variable locale par une constante (sans passer par la pile).' },

  // Conversions
  i2l: { mnemonic: 'i2l', category: 'Conversions', stack: '..., int → ..., long', description: 'Convertit un int en long.' },
  i2f: { mnemonic: 'i2f', category: 'Conversions', stack: '..., int → ..., float', description: 'Convertit un int en float.' },
  i2d: { mnemonic: 'i2d', category: 'Conversions', stack: '..., int → ..., double', description: 'Convertit un int en double.' },
  l2i: { mnemonic: 'l2i', category: 'Conversions', stack: '..., long → ..., int', description: 'Convertit un long en int.' },
  l2f: { mnemonic: 'l2f', category: 'Conversions', stack: '..., long → ..., float', description: 'Convertit un long en float.' },
  l2d: { mnemonic: 'l2d', category: 'Conversions', stack: '..., long → ..., double', description: 'Convertit un long en double.' },
  f2i: { mnemonic: 'f2i', category: 'Conversions', stack: '..., float → ..., int', description: 'Convertit un float en int.' },
  f2l: { mnemonic: 'f2l', category: 'Conversions', stack: '..., float → ..., long', description: 'Convertit un float en long.' },
  f2d: { mnemonic: 'f2d', category: 'Conversions', stack: '..., float → ..., double', description: 'Convertit un float en double.' },
  d2i: { mnemonic: 'd2i', category: 'Conversions', stack: '..., double → ..., int', description: 'Convertit un double en int.' },
  d2l: { mnemonic: 'd2l', category: 'Conversions', stack: '..., double → ..., long', description: 'Convertit un double en long.' },
  d2f: { mnemonic: 'd2f', category: 'Conversions', stack: '..., double → ..., float', description: 'Convertit un double en float.' },
  i2b: { mnemonic: 'i2b', category: 'Conversions', stack: '..., int → ..., byte', description: 'Tronque un int en signed byte.' },
  i2c: { mnemonic: 'i2c', category: 'Conversions', stack: '..., int → ..., char', description: 'Tronque un int en char non signé sur 16 bits.' },
  i2s: { mnemonic: 'i2s', category: 'Conversions', stack: '..., int → ..., short', description: 'Tronque un int en signed short sur 16 bits.' },

  // Comparisons
  lcmp: { mnemonic: 'lcmp', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compare deux longs (`-1`, `0`, ou `1`).' },
  fcmpl: { mnemonic: 'fcmpl', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compare deux floats (`-1` si l’un est NaN).' },
  fcmpg: { mnemonic: 'fcmpg', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compare deux floats (`1` si l’un est NaN).' },
  dcmpl: { mnemonic: 'dcmpl', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compare deux doubles (`-1` si l’un est NaN).' },
  dcmpg: { mnemonic: 'dcmpg', category: 'Comparisons', stack: '..., val1, val2 → ..., result', description: 'Compare deux doubles (`1` si l’un est NaN).' },
  ifeq: { mnemonic: 'ifeq', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si l’entier vaut 0 (`value == 0`).' },
  ifne: { mnemonic: 'ifne', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si l’entier est différent de 0 (`value != 0`).' },
  iflt: { mnemonic: 'iflt', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si l’entier est strictement négatif (`value < 0`).' },
  ifge: { mnemonic: 'ifge', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si l’entier est supérieur ou égal à 0 (`value >= 0`).' },
  ifgt: { mnemonic: 'ifgt', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si l’entier est strictement positif (`value > 0`).' },
  ifle: { mnemonic: 'ifle', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si l’entier est inférieur ou égal à 0 (`value <= 0`).' },
  if_icmpeq: { mnemonic: 'if_icmpeq', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Saute si les deux entiers sont égaux (`val1 == val2`).' },
  if_icmpne: { mnemonic: 'if_icmpne', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Saute si les deux entiers sont différents (`val1 != val2`).' },
  if_icmplt: { mnemonic: 'if_icmplt', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Saute si `val1 < val2`.' },
  if_icmpge: { mnemonic: 'if_icmpge', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Saute si `val1 >= val2`.' },
  if_icmpgt: { mnemonic: 'if_icmpgt', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Saute si `val1 > val2`.' },
  if_icmple: { mnemonic: 'if_icmple', category: 'Control', stack: '..., val1, val2 → ...', operands: 'branchoffset', description: 'Saute si `val1 <= val2`.' },
  if_acmpeq: { mnemonic: 'if_acmpeq', category: 'Control', stack: '..., ref1, ref2 → ...', operands: 'branchoffset', description: 'Saute si les deux références d’objets sont identiques (`ref1 == ref2`).' },
  if_acmpne: { mnemonic: 'if_acmpne', category: 'Control', stack: '..., ref1, ref2 → ...', operands: 'branchoffset', description: 'Saute si les deux références d’objets sont distinctes (`ref1 != ref2`).' },
  ifnull: { mnemonic: 'ifnull', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si la référence d’objet est `null`.' },
  ifnonnull: { mnemonic: 'ifnonnull', category: 'Control', stack: '..., value → ...', operands: 'branchoffset', description: 'Saute si la référence d’objet n’est pas `null`.' },

  // Jumps & Switches
  goto: { mnemonic: 'goto', category: 'Control', stack: '[no change]', operands: 'branchoffset', description: 'Saut inconditionnel vers l’offset spécifié.' },
  goto_w: { mnemonic: 'goto_w', category: 'Control', stack: '[no change]', operands: 'branchoffset (32-bit)', description: 'Saut inconditionnel vers un grand offset (32 bits).' },
  tableswitch: { mnemonic: 'tableswitch', category: 'Control', stack: '..., index → ...', description: 'Instruction switch compacte par table de saut consécutive (O(1)).' },
  lookupswitch: { mnemonic: 'lookupswitch', category: 'Control', stack: '..., key → ...', description: 'Instruction switch par paires clé-offset triées (recherche dichotomique O(log N)).' },

  // Returns
  ireturn: { mnemonic: 'ireturn', category: 'Returns', stack: '..., value → [empty]', description: 'Retourne un entier (`int`, `boolean`, `byte`, `char`, `short`) depuis la méthode courante.' },
  lreturn: { mnemonic: 'lreturn', category: 'Returns', stack: '..., value → [empty]', description: 'Retourne un `long` depuis la méthode courante.' },
  freturn: { mnemonic: 'freturn', category: 'Returns', stack: '..., value → [empty]', description: 'Retourne un `float` depuis la méthode courante.' },
  dreturn: { mnemonic: 'dreturn', category: 'Returns', stack: '..., value → [empty]', description: 'Retourne un `double` depuis la méthode courante.' },
  areturn: { mnemonic: 'areturn', category: 'Returns', stack: '..., objectref → [empty]', description: 'Retourne une référence d’objet depuis la méthode courante.' },
  return: { mnemonic: 'return', category: 'Returns', stack: '... → [empty]', description: 'Retourne `void` depuis la méthode courante.' },

  // References & Method Invocations
  getstatic: {
    mnemonic: 'getstatic',
    category: 'References',
    stack: '... → ..., value',
    operands: 'index16 (Fieldref)',
    description: 'Lit la valeur d’un champ statique d’une classe depuis le Constant Pool.'
  },
  putstatic: {
    mnemonic: 'putstatic',
    category: 'References',
    stack: '..., value → ...',
    operands: 'index16 (Fieldref)',
    description: 'Définit la valeur d’un champ statique d’une classe.'
  },
  getfield: {
    mnemonic: 'getfield',
    category: 'References',
    stack: '..., objectref → ..., value',
    operands: 'index16 (Fieldref)',
    description: 'Lit la valeur d’un champ d’instance de l’objet `objectref`.'
  },
  putfield: {
    mnemonic: 'putfield',
    category: 'References',
    stack: '..., objectref, value → ...',
    operands: 'index16 (Fieldref)',
    description: 'Définit la valeur d’un champ d’instance de l’objet `objectref`.'
  },
  invokevirtual: {
    mnemonic: 'invokevirtual',
    category: 'Methods',
    stack: '..., objectref, [arg1, arg2 ...] → ...',
    operands: 'index16 (Methodref)',
    description: 'Invoque une méthode d’instance avec dispatch polymorphique standard (late binding basé sur la classe réelle de l’objet).'
  },
  invokespecial: {
    mnemonic: 'invokespecial',
    category: 'Methods',
    stack: '..., objectref, [arg1, arg2 ...] → ...',
    operands: 'index16 (Methodref)',
    description: 'Invoque une méthode d’instance sans polymorphisme : constructeur d’instance (`<init>`), méthode privée, ou méthode de la superclasse (`super.method()`).'
  },
  invokestatic: {
    mnemonic: 'invokestatic',
    category: 'Methods',
    stack: '..., [arg1, arg2 ...] → ...',
    operands: 'index16 (Methodref)',
    description: 'Invoque une méthode statique de classe (aucun `objectref` requis).'
  },
  invokeinterface: {
    mnemonic: 'invokeinterface',
    category: 'Methods',
    stack: '..., objectref, [arg1, arg2 ...] → ...',
    operands: 'index16 (InterfaceMethodref), count, 0',
    description: 'Invoque une méthode déclarée dans une interface Java.'
  },
  invokedynamic: {
    mnemonic: 'invokedynamic',
    category: 'Methods',
    stack: '..., [arg1, arg2 ...] → ...',
    operands: 'index16 (InvokeDynamic), 0, 0',
    description: 'Invoque une méthode dynamique via une méthode bootstrap (indispensable pour les expressions lambda Java, records et string concat).'
  },

  // Object & Array creation
  new: {
    mnemonic: 'new',
    category: 'References',
    stack: '... → ..., objectref',
    operands: 'index16 (Class)',
    description: 'Alloue de la mémoire pour un nouvel objet et empile sa référence non initialisée.'
  },
  newarray: {
    mnemonic: 'newarray',
    category: 'Arrays',
    stack: '..., count → ..., arrayref',
    operands: 'atype',
    description: 'Crée un nouveau tableau de types primitifs (int, float, byte, boolean, etc.) de taille `count`.'
  },
  anewarray: {
    mnemonic: 'anewarray',
    category: 'Arrays',
    stack: '..., count → ..., arrayref',
    operands: 'index16 (Class)',
    description: 'Crée un nouveau tableau de références d’objets de taille `count`.'
  },
  arraylength: {
    mnemonic: 'arraylength',
    category: 'Arrays',
    stack: '..., arrayref → ..., length',
    description: 'Retourne la longueur d’un tableau.'
  },
  athrow: {
    mnemonic: 'athrow',
    category: 'Exceptions',
    stack: '..., objectref → [empty], objectref',
    description: 'Lève l’exception référencée par `objectref`.'
  },
  checkcast: {
    mnemonic: 'checkcast',
    category: 'References',
    stack: '..., objectref → ..., objectref',
    operands: 'index16 (Class)',
    description: 'Vérifie que l’objet est d’un type donné. Lève `ClassCastException` en cas d’échec.'
  },
  instanceof: {
    mnemonic: 'instanceof',
    category: 'References',
    stack: '..., objectref → ..., result (0 ou 1)',
    operands: 'index16 (Class)',
    description: 'Teste si un objet est une instance de la classe ou interface spécifiée.'
  },
  monitorenter: {
    mnemonic: 'monitorenter',
    category: 'Concurrency',
    stack: '..., objectref → ...',
    description: 'Acquiert le moniteur de synchronisation de l’objet (bloc `synchronized`).'
  },
  monitorexit: {
    mnemonic: 'monitorexit',
    category: 'Concurrency',
    stack: '..., objectref → ...',
    description: 'Libère le moniteur de synchronisation de l’objet.'
  },
  multianewarray: {
    mnemonic: 'multianewarray',
    category: 'Arrays',
    stack: '..., count1, [count2 ...] → ..., arrayref',
    operands: 'index16 (Class), dimensions',
    description: 'Crée un nouveau tableau multidimensionnel.'
  }
};
