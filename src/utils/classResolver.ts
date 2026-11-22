import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class ClassResolver {
  /**
   * Tries to find the matching .class file for a given .java file URI
   */
  public static async findClassForJavaFile(javaUri: vscode.Uri): Promise<string | null> {
    const javaPath = javaUri.fsPath;
    const baseName = path.basename(javaPath, '.java');
    const classFileName = `${baseName}.class`;

    // 1. Direct heuristic mapping (instant & immune to .gitignore)
    const directCandidates = this.getDirectClassCandidates(javaPath);
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
    const normalizedJava = javaPath.replace(/\\/g, '/');

    let bestMatch: string | null = null;
    let bestScore = -1;

    for (const match of matches) {
      const matchPath = match.fsPath.replace(/\\/g, '/');

      // Compare suffixes (package segments)
      const javaSegments = normalizedJava.split('/');
      const classSegments = matchPath.split('/');

      let score = 0;
      let j = javaSegments.length - 2; // skip file name
      let c = classSegments.length - 2;

      while (j >= 0 && c >= 0 && javaSegments[j] === classSegments[c]) {
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
   * Tries to find the matching .java source file for a given .class file path
   */
  public static async findJavaFileForClass(classFilePath: string): Promise<vscode.Uri | null> {
    let baseName = path.basename(classFilePath, '.class');
    // If it's an inner class (e.g. App$Builder.class or App$1.class), get outer class name
    const dollarIndex = baseName.indexOf('$');
    if (dollarIndex !== -1) {
      baseName = baseName.substring(0, dollarIndex);
    }

    // 1. Direct heuristic mapping (instant)
    const directJavaCandidates = this.getDirectJavaCandidates(classFilePath, baseName);
    for (const candidate of directJavaCandidates) {
      if (fs.existsSync(candidate)) {
        return vscode.Uri.file(candidate);
      }
    }

    const javaFileName = `${baseName}.java`;
    // 2. Search in workspace with exclude=null
    const matches = await vscode.workspace.findFiles(`**/${javaFileName}`, null, 50);

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
      const javaPath = match.fsPath.replace(/\\/g, '/');
      const javaSegments = javaPath.split('/');
      const classSegments = normalizedClass.split('/');

      let score = 0;
      let j = javaSegments.length - 2;
      let c = classSegments.length - 2;

      while (j >= 0 && c >= 0 && javaSegments[j] === classSegments[c]) {
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

  private static getDirectClassCandidates(javaPath: string): string[] {
    const candidates: string[] = [];
    const normalized = javaPath.replace(/\\/g, '/');

    // Gradle main: src/main/java/... -> build/classes/java/main/...
    if (normalized.includes('/src/main/java/')) {
      const gradleMain = normalized.replace('/src/main/java/', '/build/classes/java/main/').replace(/\.java$/, '.class');
      candidates.push(path.normalize(gradleMain));
      const mavenMain = normalized.replace('/src/main/java/', '/target/classes/').replace(/\.java$/, '.class');
      candidates.push(path.normalize(mavenMain));
      const eclipseMain = normalized.replace('/src/main/java/', '/bin/').replace(/\.java$/, '.class');
      candidates.push(path.normalize(eclipseMain));
    }

    // Gradle test: src/test/java/... -> build/classes/java/test/...
    if (normalized.includes('/src/test/java/')) {
      const gradleTest = normalized.replace('/src/test/java/', '/build/classes/java/test/').replace(/\.java$/, '.class');
      candidates.push(path.normalize(gradleTest));
      const mavenTest = normalized.replace('/src/test/java/', '/target/test-classes/').replace(/\.java$/, '.class');
      candidates.push(path.normalize(mavenTest));
    }

    // Generic src/... -> bin/...
    if (normalized.includes('/src/')) {
      const binCandidate = normalized.replace('/src/', '/bin/').replace(/\.java$/, '.class');
      candidates.push(path.normalize(binCandidate));
    }

    return candidates;
  }

  private static getDirectJavaCandidates(classFilePath: string, baseName: string): string[] {
    const candidates: string[] = [];
    const normalized = classFilePath.replace(/\\/g, '/');
    const classBase = path.basename(classFilePath);
    const targetFile = `${baseName}.java`;

    // Gradle main: build/classes/java/main/... -> src/main/java/...
    if (normalized.includes('/build/classes/java/main/')) {
      const srcMain = normalized.replace('/build/classes/java/main/', '/src/main/java/').replace(classBase, targetFile);
      candidates.push(path.normalize(srcMain));
    }

    // Gradle test: build/classes/java/test/... -> src/test/java/...
    if (normalized.includes('/build/classes/java/test/')) {
      const srcTest = normalized.replace('/build/classes/java/test/', '/src/test/java/').replace(classBase, targetFile);
      candidates.push(path.normalize(srcTest));
    }

    // Maven main: target/classes/... -> src/main/java/...
    if (normalized.includes('/target/classes/')) {
      const srcMain = normalized.replace('/target/classes/', '/src/main/java/').replace(classBase, targetFile);
      candidates.push(path.normalize(srcMain));
    }

    // Maven test: target/test-classes/... -> src/test/java/...
    if (normalized.includes('/target/test-classes/')) {
      const srcTest = normalized.replace('/target/test-classes/', '/src/test/java/').replace(classBase, targetFile);
      candidates.push(path.normalize(srcTest));
    }

    // Bin: bin/... -> src/main/java/... or src/...
    if (normalized.includes('/bin/')) {
      candidates.push(path.normalize(normalized.replace('/bin/', '/src/main/java/').replace(classBase, targetFile)));
      candidates.push(path.normalize(normalized.replace('/bin/', '/src/').replace(classBase, targetFile)));
    }

    return candidates;
  }
}
