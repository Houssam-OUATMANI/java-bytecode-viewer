import * as vscode from 'vscode';
import { execFile } from 'child_process';
import { JavapFinder } from './javapFinder';

export interface JavapOptions {
  verbose?: boolean;
  privateMembers?: boolean;
  lineAndLocalVars?: boolean;
  constants?: boolean;
}

export class JavapRunner {
  public static async disassemble(classFilePath: string, overrideOptions?: JavapOptions): Promise<string> {
    const javapPath = await JavapFinder.getJavapPath();
    const config = vscode.workspace.getConfiguration('javaBytecode');

    const verbose = overrideOptions?.verbose ?? config.get<boolean>('verbose', true);
    const privateMembers = overrideOptions?.privateMembers ?? config.get<boolean>('showPrivateMembers', true);
    const lineAndLocalVars = overrideOptions?.lineAndLocalVars ?? config.get<boolean>('showLineAndLocalVariableTables', true);

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
        { maxBuffer: 10 * 1024 * 1024, encoding: 'utf-8' },
        (error, stdout, stderr) => {
          if (error) {
            const errorMsg = stderr ? stderr : error.message;
            reject(new Error(`javap failed: ${errorMsg}`));
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }
}

