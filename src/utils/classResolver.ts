import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class ClassResolver {
  /**
   * Tries to find the matching .class file for a given source (.java or .kt) file URI
   */
  public static async findClassForJavaFile(sourceUri: vscode.Uri): Promise<string | null> {
    const sourcePath = sourceUri.fsPath;
    const ext = path.extname(sourcePath);
    const baseName = path.basename(sourcePath, ext);
    const classFileName = `${baseName}.class`;

    // 1. Direct heuristic mapping (instant & immune to .gitignore)
    const directCandidates = this.getDirectClassCandidates(sourcePath);
    for (const candidate of directCandidates) {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    // 2. Search in workspace for classFileName with exclude=null so build/ and target/ are NOT ignored
    const matches = await vscode.workspace.findFiles(`**/${classFileName}`, null, 50);

    if (matches.length === 0) {
      return null;
    }

    if (matches.length === 1) {
      return matches[0].fsPath;
    }

    // If multiple matches (e.g. multi-module project or main vs test), find best package/path match
    const normalizedSource = sourcePath.replace(/\\/g, '/');

    let bestMatch: string | null = null;
    let bestScore = -1;

    for (const match of matches) {
      const matchPath = match.fsPath.replace(/\\/g, '/');

      // Compare suffixes (package segments)
      const sourceSegments = normalizedSource.split('/');
      const classSegments = matchPath.split('/');

      let score = 0;
      let j = sourceSegments.length - 2; // skip file name
      let c = classSegments.length - 2;

      while (j >= 0 && c >= 0 && sourceSegments[j] === classSegments[c]) {
        score++;
        j--;
        c--;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = match.fsPath;
      }
    }

    return bestMatch || matches[0].fsPath;
  }

  /**
   * Tries to find the matching source file (.java or .kt) for a given .class file path
   */
  public static async findJavaFileForClass(classFilePath: string): Promise<vscode.Uri | null> {
    let baseName = path.basename(classFilePath, '.class');
    // If it's an inner class (e.g. App$Builder.class or App$1.class), get outer class name
    const dollarIndex = baseName.indexOf('$');
    if (dollarIndex !== -1) {
      baseName = baseName.substring(0, dollarIndex);
    }

    // 1. Direct heuristic mapping (instant)
    const directSourceCandidates = this.getDirectSourceCandidates(classFilePath, baseName);
    for (const candidate of directSourceCandidates) {
      if (fs.existsSync(candidate)) {
        return vscode.Uri.file(candidate);
      }
    }

    // 2. Search in workspace with exclude=null (.java and .kt)
    const matchesJava = await vscode.workspace.findFiles(`**/${baseName}.java`, null, 25);
    const matchesKt = await vscode.workspace.findFiles(`**/${baseName}.kt`, null, 25);
    const matches = [...matchesJava, ...matchesKt];

    if (matches.length === 0) {
      return null;
    }

    if (matches.length === 1) {
      return matches[0];
    }

    const normalizedClass = classFilePath.replace(/\\/g, '/');
    let bestMatch: vscode.Uri | null = null;
    let bestScore = -1;

    for (const match of matches) {
      const sourcePath = match.fsPath.replace(/\\/g, '/');
      const sourceSegments = sourcePath.split('/');
      const classSegments = normalizedClass.split('/');

      let score = 0;
      let j = sourceSegments.length - 2;
      let c = classSegments.length - 2;

      while (j >= 0 && c >= 0 && sourceSegments[j] === classSegments[c]) {
        score++;
        j--;
        c--;
      }

      if (score > bestScore) {
        bestScore = score;
        bestMatch = match;
      }
    }

    return bestMatch || matches[0];
  }

  private static getDirectClassCandidates(sourcePath: string): string[] {
    const candidates: string[] = [];
    const normalized = sourcePath.replace(/\\/g, '/');
    const ext = path.extname(sourcePath);

    // Gradle Java main: src/main/java/... -> build/classes/java/main/...
    if (normalized.includes('/src/main/java/')) {
      const gradleMain = normalized.replace('/src/main/java/', '/build/classes/java/main/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(gradleMain));
      const mavenMain = normalized.replace('/src/main/java/', '/target/classes/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(mavenMain));
      const eclipseMain = normalized.replace('/src/main/java/', '/bin/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(eclipseMain));
    }

    // Gradle Kotlin main: src/main/kotlin/... -> build/classes/kotlin/main/...
    if (normalized.includes('/src/main/kotlin/')) {
      const gradleKotlinMain = normalized.replace('/src/main/kotlin/', '/build/classes/kotlin/main/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(gradleKotlinMain));
      const gradleJavaMain = normalized.replace('/src/main/kotlin/', '/build/classes/java/main/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(gradleJavaMain));
      const mavenMain = normalized.replace('/src/main/kotlin/', '/target/classes/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(mavenMain));
    }

    // Gradle Java test: src/test/java/... -> build/classes/java/test/...
    if (normalized.includes('/src/test/java/')) {
      const gradleTest = normalized.replace('/src/test/java/', '/build/classes/java/test/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(gradleTest));
      const mavenTest = normalized.replace('/src/test/java/', '/target/test-classes/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(mavenTest));
    }

    // Gradle Kotlin test: src/test/kotlin/... -> build/classes/kotlin/test/...
    if (normalized.includes('/src/test/kotlin/')) {
      const gradleKotlinTest = normalized.replace('/src/test/kotlin/', '/build/classes/kotlin/test/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(gradleKotlinTest));
      const mavenTest = normalized.replace('/src/test/kotlin/', '/target/test-classes/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(mavenTest));
    }

    // Generic src/... -> bin/...
    if (normalized.includes('/src/')) {
      const binCandidate = normalized.replace('/src/', '/bin/').replace(/\.[^.]+$/, '.class');
      candidates.push(path.normalize(binCandidate));
    }

    return candidates;
  }

  private static getDirectSourceCandidates(classFilePath: string, baseName: string): string[] {
    const candidates: string[] = [];
    const normalized = classFilePath.replace(/\\/g, '/');
    const classBase = path.basename(classFilePath);

    for (const ext of ['.java', '.kt']) {
      const targetFile = `${baseName}${ext}`;

      // Gradle Java main
      if (normalized.includes('/build/classes/java/main/')) {
        candidates.push(path.normalize(normalized.replace('/build/classes/java/main/', '/src/main/java/').replace(classBase, targetFile)));
      }

      // Gradle Kotlin main
      if (normalized.includes('/build/classes/kotlin/main/')) {
        candidates.push(path.normalize(normalized.replace('/build/classes/kotlin/main/', '/src/main/kotlin/').replace(classBase, targetFile)));
      }

      // Gradle Java test
      if (normalized.includes('/build/classes/java/test/')) {
        candidates.push(path.normalize(normalized.replace('/build/classes/java/test/', '/src/test/java/').replace(classBase, targetFile)));
      }

      // Gradle Kotlin test
      if (normalized.includes('/build/classes/kotlin/test/')) {
        candidates.push(path.normalize(normalized.replace('/build/classes/kotlin/test/', '/src/test/kotlin/').replace(classBase, targetFile)));
      }

      // Maven main
      if (normalized.includes('/target/classes/')) {
        candidates.push(path.normalize(normalized.replace('/target/classes/', '/src/main/java/').replace(classBase, targetFile)));
        candidates.push(path.normalize(normalized.replace('/target/classes/', '/src/main/kotlin/').replace(classBase, targetFile)));
      }

      // Maven test
      if (normalized.includes('/target/test-classes/')) {
        candidates.push(path.normalize(normalized.replace('/target/test-classes/', '/src/test/java/').replace(classBase, targetFile)));
        candidates.push(path.normalize(normalized.replace('/target/test-classes/', '/src/test/kotlin/').replace(classBase, targetFile)));
      }

      // Bin
      if (normalized.includes('/bin/')) {
        candidates.push(path.normalize(normalized.replace('/bin/', '/src/main/java/').replace(classBase, targetFile)));
        candidates.push(path.normalize(normalized.replace('/bin/', '/src/').replace(classBase, targetFile)));
      }
    }

    return candidates;
  }
}
