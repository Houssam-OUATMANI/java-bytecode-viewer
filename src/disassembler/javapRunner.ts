import * as vscode from 'vscode';
import * as fs from 'fs';
import { execFile } from 'child_process';
import { JavapFinder } from './javapFinder';

export interface JavapOptions {
  verbose?: boolean;
  privateMembers?: boolean;
  lineAndLocalVars?: boolean;
}

interface CacheEntry {
  mtimeMs: number;
  optionsKey: string;
  output: string;
}

export class JavapRunner {
  private static cache = new Map<string, CacheEntry>();

  public static clearCache(classFilePath?: string): void {
    if (classFilePath) {
      this.cache.delete(classFilePath);
    } else {
      this.cache.clear();
    }
  }

  public static async disassemble(classFilePath: string, overrideOptions?: JavapOptions): Promise<string> {
    const javapPath = await JavapFinder.getJavapPath();
    const config = vscode.workspace.getConfiguration('javaBytecode');

    const verbose = overrideOptions?.verbose ?? config.get<boolean>('verbose', true);
    const privateMembers = overrideOptions?.privateMembers ?? config.get<boolean>('showPrivateMembers', true);
    const lineAndLocalVars = overrideOptions?.lineAndLocalVars ?? config.get<boolean>('showLineAndLocalVariableTables', true);

    const optionsKey = `v:${verbose}|p:${privateMembers}|l:${lineAndLocalVars}`;

    // Check disk cache with mtime
    try {
      if (fs.existsSync(classFilePath)) {
        const stat = fs.statSync(classFilePath);
        const cached = this.cache.get(classFilePath);
        if (cached && cached.mtimeMs === stat.mtimeMs && cached.optionsKey === optionsKey) {
          return cached.output;
        }
      }
    } catch {
      // Ignore cache check errors
    }

    const args: string[] = ['-c'];

    if (verbose) {
      args.push('-v');
    }
    if (privateMembers) {
      args.push('-p');
    }
    if (lineAndLocalVars) {
      args.push('-l');
    }

    args.push(classFilePath);

    return new Promise((resolve, reject) => {
      execFile(
        javapPath,
        args,
        { maxBuffer: 15 * 1024 * 1024, encoding: 'utf-8' },
        (error, stdout, stderr) => {
          if (error) {
            const errorMsg = stderr ? stderr : error.message;
            reject(new Error(`javap failed: ${errorMsg}`));
          } else {
            // Save in cache
            try {
              if (fs.existsSync(classFilePath)) {
                const stat = fs.statSync(classFilePath);
                this.cache.set(classFilePath, {
                  mtimeMs: stat.mtimeMs,
                  optionsKey,
                  output: stdout
                });
              }
            } catch {
              // Ignore cache write error
            }

            resolve(stdout);
          }
        }
      );
    });
  }
}
