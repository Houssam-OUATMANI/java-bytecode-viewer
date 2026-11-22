# Changelog

All notable changes to the **Java Bytecode Viewer** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---



## [2.1.0] - 2026-11-22

### Fixed
- **Zombie Auto-Reopening Loop**:
  - Fixed an issue where closing a `.java` source file caused it to immediately reopen because cursor focus returned to the bytecode editor and triggered automatic file opening.
  - Cursor synchronization now strictly synchronizes only with already visible editors.
  - Added strict source-to-bytecode identity verification so cursor sync only pairs with the exact corresponding class and source file.

### Added
- **Explicit "Go to Source File" Action (`javaBytecode.goToSourceFile`)**:
  - Added a dedicated button `$(go-to-file)` in the bytecode editor title bar and command to jump to the matching `.java` or `.kt` source file at the exact line corresponding to the current bytecode cursor position.
- **Constant Pool `#<id>` Inline Hover Previews**:
  - Hovering over any constant pool index reference (`#1`, `#15`, etc.) anywhere in instructions or pool definitions displays its complete declaration directly in an inline tooltip without scrolling.
- **Kotlin (`.kt`) Source Support**:
  - Full bidirectional resolution between Kotlin source files (`src/main/kotlin/**/*.kt`) and compiled classes (`build/classes/kotlin/**/*.class`).

## [2.0.0] - 2026-11-17

### Added
- **Interactive JVM Opcode Tooltips (`HoverProvider`)**:
  - Rich hover documentation for all standard JVM opcodes (loads, stores, math, control, invokes, references).
  - Displays operand stack transitions (`..., val1, val2 → ..., result`), operands, and JVM specification summaries.
  - Hover documentation for Constant Pool tags (`Methodref`, `Fieldref`, `InvokeDynamic`, etc.).
- **Code Folding (`FoldingRangeProvider`)**:
  - Fold and unfold the `Constant pool:` block, class body, individual methods, and debug blocks (`Code:`, `LineNumberTable:`, `LocalVariableTable:`, `StackMapTable:`).
- **Bi-directional Cursor Sync with Debounce**:
  - Clicking on a bytecode instruction scrolls and highlights the corresponding line in the `.java` source file.
  - Smooth 120ms debounce and mutual loop protection preventing cursor jitter.
- **Internal Type Signatures Toggle (`-s`)**:
  - One-click toolbar toggle and setting `javaBytecode.showInternalSignatures` to inspect internal JVM type signatures (e.g. `(Ljava/lang/String;I)Z`).
- **Bytecode Snapshot & Diff (`Compare with Snapshot`)**:
  - Take a bytecode snapshot before code edits, recompile, and inspect differences in VS Code's side-by-side diff viewer.
  - Compare any two `.class` files directly from the Class Explorer context menu (`Select for Compare` and `Compare with Selected`).

### Fixed
- **Gradle & Spring Initializr Microservices Detection**:
  - Fixed an issue where `.gitignore` containing `build/` prevented VS Code's `findFiles` from discovering compiled classes in `build/classes/java/main`.
  - Added fast direct disk discovery for Gradle (`build/classes/java/main`, `build/classes/kotlin/main`, etc.) across root and multi-module microservice directories.
  - Added instant heuristic class resolution mapping `src/main/java/...` to `build/classes/java/main/...`.
  - Expanded `activationEvents` to match nested Gradle/Maven files (`**/build.gradle`, `**/pom.xml`, `**/settings.gradle`).

## [1.0.0] - 2026-11-05

### Improved
- The class explorer now uses the configured output-directory globs and no longer truncates discovery at 500 class files.
- Package discovery now uses asynchronous, cached directory scans.
- Source-to-bytecode cursor synchronization resolves instruction offsets within their containing method.
- Toolbar toggles now save to workspace settings, with confirmation required before changing global settings when no workspace is open.

### Tests
- Added focused tests for method-scoped bytecode line mapping.

## [0.2.0] - 2026-11-01

### Added
- **Interactive Toolbar Toggles**:
  - `Toggle Verbose`: Instantly hide or show Constant Pool and stack map frames.
  - `Toggle Private Members`: Show or hide private fields and methods (`-p`).
  - `Toggle Line Numbers`: Show or hide `LineNumberTable` and `LocalVariableTable` debug blocks (`-l`).
- **Live Cursor Synchronization**: Automatic bi-directional tracking from `.java` source code cursor line to corresponding bytecode instruction offset.
- **Document Outline & Breadcrumbs**: Native VS Code symbols for Constant Pool, constructors, methods, and fields.
- **Interactive Constant Pool Hyperlinks**: Click `#index` references in bytecode to jump straight to their definition.
- **Inner Classes Nesting**: Grouped `Outer$Inner.class` and `Outer$1.class` under the outer class item in the tree view.
- **Multi-Module Project Support**: Dynamic discovery of compiled output directories across all Maven and Gradle sub-modules.
- **In-Memory Disassembly Cache**: Timestamp-validated (`mtime`) cache eliminating JVM invocation latency on tab switches.
- **Store & JetBrains Visuals**: Added 256x256 official Marketplace icon and JetBrains-inspired binary activity bar icon.

### Fixed
- Fixed class resolution when disassembling `.class` files via the virtual document provider.

---

## [0.1.0] - 2026-10-31

### Added
- Initial release of Java Bytecode Viewer.
- Activity Bar explorer container for compiled Java classes (`target/classes`, `build/classes`, `bin`).
- Selective activation targeting Java projects (`pom.xml`, `build.gradle`, `.java`).
- `javabytecode://` virtual read-only document provider.
- Full TextMate syntax highlighting for JVM opcodes, registers, and constant pool tags.
- Automatic JDK auto-detection (support for JDK 8 up to Java 25+).
- Real-time file system watcher on `**/*.class` files.
- "Java: Show Bytecode" editor title button for split-view inspection.
