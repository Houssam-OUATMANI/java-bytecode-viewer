# Java Bytecode Viewer for Visual Studio Code

[![GitHub Release](https://img.shields.io/github/v/release/Houssam-OUATMANI/java-bytecode-viewer?include_prereleases&color=blue)](https://github.com/Houssam-OUATMANI/java-bytecode-viewer/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/Houssam-OUATMANI/java-bytecode-viewer/blob/master/LICENSE)
[![Engine](https://img.shields.io/badge/VS%20Code-%3E%3D%201.85.0-brightgreen.svg)](https://code.visualstudio.com)
[![GitHub Stars](https://img.shields.io/github/stars/Houssam-OUATMANI/java-bytecode-viewer?style=social)](https://github.com/Houssam-OUATMANI/java-bytecode-viewer)

> View and analyze Java compiled bytecode directly inside VS Code

![Java Bytecode Viewer Showcase](media/showcase-java-bytecode.png)

---

## Features

###  1. Activity Bar Bytecode Explorer
* Dedicated activity bar icon with a clean, hierarchical tree view of all compiled `.class` files.
* **Intelligent Package Compacting**: Automatically collapses single-child packages (`com.example.service` instead of 3 deep folders).
* **Inner & Anonymous Classes Nesting**: Nested classes (`Outer$Inner.class`, `Outer$1.class`) are neatly organized under their outer class with child badges.
* **Multi-Module Support**: Seamlessly discovers build directories across multi-module Maven (`target/classes`), Gradle (`build/classes`), and Eclipse/VS Code (`bin`).
* **Instant Hot-Reload**: A built-in file watcher detects re-compilations (`mvn compile`, `./gradlew build`) and updates both the tree and any open bytecode viewer in real time.

### 🎯 2. Bi-directional Code $\leftrightarrow$ Bytecode Cursor Sync (with Debounce)
* Open any `.java` source file and click the **"Java: Show Bytecode"** button in the editor title bar to open its bytecode side-by-side (*Split View*).
* **Two-Way Synchronization**: Moving your cursor in `.java` highlights the corresponding bytecode offset; clicking on any instruction in the bytecode editor instantly selects the matching `.java` source line!
* **Smooth 120ms Debounce**: Zero stutter or editor freezing during fast typing or rapid cursor movements.

### 🔘 3. One-Click Toolbar Toggles
No need to dig into configuration files to switch views. Quick toggles sit directly in the bytecode editor title bar:
* **Toggle Verbose (Constant Pool)** (`$(list-tree)`) : Instantly hide or show the constant pool table and stack map frames to focus purely on method instructions.
* **Toggle Private Members** (`$(eye)`) : Toggle visibility of private methods and fields (`-p`).
* **Toggle Line Number Tables** (`$(list-ordered)`) : Toggle `LineNumberTable` and `LocalVariableTable` debug blocks (`-l`).
* **Toggle Signatures** (`$(symbol-variable)`) : Display internal JVM type signatures (`-s`, e.g. `(Ljava/lang/String;I)Z`).

### 📖 4. JVM Opcode Hover Documentation & Stack Transitions
* Hover over any JVM instruction (`invokevirtual`, `aload_0`, `monitorenter`, `bipush`, `tableswitch`, etc.) to view:
  * Official JVM specification summary.
  * Operand stack transitions (`..., val1, val2 → ..., result`).
  * Required operands and byte formats.
* Hover over Constant Pool tags (`Methodref`, `Fieldref`, `InvokeDynamic`, etc.) for clear explanations.

### 📑 5. Code Folding & Outline Navigation
* **Folding Ranges**: Fold/unfold the Constant Pool block, class body, individual methods, and sub-blocks (`Code:`, `LineNumberTable:`, `LocalVariableTable:`, `StackMapTable:`).
* **Document Outline & Breadcrumbs**: Full integration with VS Code's Outline panel to jump between Constant Pool, constructors, methods, and fields.

### ⚖️ 6. Bytecode Snapshot & Side-by-Side Diff
* **Snapshot & Compare**: Take a bytecode snapshot before refactoring or changing compiler options, recompile, and inspect exact bytecode differences using VS Code's native diff editor!
* **Class Comparison**: Right-click any class in the Explorer, choose **"Select for Bytecode Compare"**, then right-click another class to compare them side-by-side.

### 🔗 7. Interactive Constant Pool Hyperlinks
* Every `#index` reference in the bytecode or constant pool (e.g. `invokevirtual #15 // Method ...`) is rendered as an interactive hyperlink.
* `Ctrl + Click` (or click) on `#15` to jump straight to its declaration line in the Constant Pool!

### ⚡ 8. Zero-Config & Lightning Fast
* **Auto-detects JDK**: Scans `JAVA_HOME`, `PATH`, and standard installation paths on Windows, macOS, and Linux (JDK 8 up to Java 25+).
* **Smart Memory Cache**: Avoids re-invoking JVM processes on tab switches by caching disassemblies with file modification timestamps (`mtime`).

---

## ⚙️ Configuration

Customize the extension behavior via your VS Code Settings (`Ctrl+,` / `Cmd+,` and search for `Java Bytecode`):

The explorer uses `javaBytecode.outputDirectories` to discover compiled classes. Toolbar toggles are saved to the current workspace; if no workspace is open, the extension asks before changing a global setting.

| Setting | Default | Description |
| :--- | :--- | :--- |
| `javaBytecode.javapPath` | `""` | Custom path to the `javap` executable. If empty, auto-detection is used. |
| `javaBytecode.verbose` | `true` | Print additional information like the Constant Pool and stack map frames (`-v`). |
| `javaBytecode.showPrivateMembers` | `true` | Show all classes and members including private ones (`-p`). |
| `javaBytecode.showLineAndLocalVariableTables` | `true` | Show line number and local variable debug tables (`-l`). |
| `javaBytecode.showInternalSignatures` | `false` | Print internal JVM type signatures (`-s`). |
| `javaBytecode.autoSyncCursor` | `true` | Automatically highlight matching bytecode instructions when moving the cursor in a `.java` file, and vice-versa. |
| `javaBytecode.outputDirectories` | `[...]` | Glob patterns for compiled class output directories (Maven, Gradle, etc.). |

---

## ⌨️ Commands

| Command | Title | Context |
| :--- | :--- | :--- |
| `javaBytecode.showCurrentFileBytecode` | **Java: Show Bytecode** | Editor title bar when editing a `.java` file |
| `javaBytecode.refreshTree` | **Refresh Classes** | View header in the Java Bytecode Explorer |
| `javaBytecode.toggleVerbose` | **Toggle Verbose (Constant Pool)** | Editor title bar when viewing bytecode |
| `javaBytecode.togglePrivateMembers` | **Toggle Private Members** | Editor title bar when viewing bytecode |
| `javaBytecode.toggleLineNumbers` | **Toggle Line Number Tables** | Editor title bar when viewing bytecode |
| `javaBytecode.toggleSignatures` | **Toggle Internal Type Signatures (-s)** | Editor title bar when viewing bytecode |
| `javaBytecode.takeSnapshot` | **Take Bytecode Snapshot** | Editor title bar / Class Explorer context menu |
| `javaBytecode.compareWithSnapshot` | **Compare with Bytecode Snapshot** | Editor title bar / Class Explorer context menu |
| `javaBytecode.selectForCompare` | **Select for Bytecode Compare** | Class Explorer item context menu |
| `javaBytecode.compareWithSelected` | **Compare with Selected Class** | Class Explorer item context menu |
| :--- | :--- | :--- |
| `javaBytecode.showCurrentFileBytecode` | **Java: Show Bytecode** | Editor title bar when editing a `.java` file |
| `javaBytecode.refreshTree` | **Refresh Classes** | View header in the Java Bytecode Explorer |
| `javaBytecode.toggleVerbose` | **Toggle Verbose (Constant Pool)** | Editor title bar when viewing bytecode |
| `javaBytecode.togglePrivateMembers` | **Toggle Private Members** | Editor title bar when viewing bytecode |
| `javaBytecode.toggleLineNumbers` | **Toggle Line Number Tables** | Editor title bar when viewing bytecode |

---

##  Building & Contributing

The extension is bundled with [Bun](https://bun.sh) and [esbuild](https://esbuild.github.io) for near-instant builds (< 50ms):

```bash
# 1. Install dependencies
bun install

# 2. Build extension
bun run build

# 3. Watch mode during development
bun run watch

# 4. Run focused tests
bun run test

# 5. Package VSIX for distribution
bunx vsce package
```

Press **F5** in VS Code to launch the Extension Development Host and test your changes.

---

##  License

This project is licensed under the MIT License.
