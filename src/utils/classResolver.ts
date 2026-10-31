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
}

