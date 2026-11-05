# Changelog

All notable changes to the **Java Bytecode Viewer** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---



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
