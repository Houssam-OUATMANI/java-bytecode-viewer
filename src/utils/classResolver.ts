import * as vscode from 'vscode';
import * as path from 'path';

export class ClassResolver {
  /**
   * Tries to find the matching .class file for a given .java file URI
   */
  public static async findClassForJavaFile(javaUri: vscode.Uri): Promise<string | null> {
    const javaPath = javaUri.fsPath;
    const baseName = path.basename(javaPath, '.java');
    const classFileName = `${baseName}.class`;

    // 1. Search in workspace for classFileName
    const matches = await vscode.workspace.findFiles(`**/${classFileName}`, '**/node_modules/**', 20);

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

    const javaFileName = `${baseName}.java`;
    const matches = await vscode.workspace.findFiles(`**/${javaFileName}`, '**/node_modules/**', 20);

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
}
