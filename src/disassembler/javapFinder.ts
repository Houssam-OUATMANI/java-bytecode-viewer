import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

export class JavapFinder {
  private static cachedPath: string | null = null;

  public static async getJavapPath(): Promise<string> {
    const config = vscode.workspace.getConfiguration('javaBytecode');
    const configuredPath = config.get<string>('javapPath');

    if (configuredPath && configuredPath.trim() !== '') {
      if (fs.existsSync(configuredPath)) {
        return configuredPath;
      }
    }

    if (this.cachedPath && fs.existsSync(this.cachedPath)) {
      return this.cachedPath;
    }

    const detected = this.detectJavap();
    if (detected) {
      this.cachedPath = detected;
      return detected;
    }

    throw new Error(
      "Impossible de trouver l'exécutable 'javap' du JDK. Assurez-vous qu'un JDK est installé et configurez 'javaBytecode.javapPath' dans les paramètres de VS Code."
    );
  }

  private static detectJavap(): string | null {
    const isWindows = process.platform === 'win32';
    const binaryName = isWindows ? 'javap.exe' : 'javap';

    // 1. Check JAVA_HOME
    const javaHome = process.env.JAVA_HOME;
    if (javaHome) {
      const candidate = path.join(javaHome, 'bin', binaryName);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    // 2. Check JDK_HOME
    const jdkHome = process.env.JDK_HOME;
    if (jdkHome) {
      const candidate = path.join(jdkHome, 'bin', binaryName);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }

    // 3. Try where/which javap in PATH
    try {
      const cmd = isWindows ? 'where javap' : 'which javap';
      const output = execSync(cmd, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
      const firstLine = output.split(/\r?\n/)[0].trim();
      if (firstLine && fs.existsSync(firstLine)) {
        return firstLine;
      }
    } catch {
      // Ignored
    }

    // 4. Windows standard install folders
    if (isWindows) {
      const standardRoots = [
        'C:\\Program Files\\Java',
        'C:\\Program Files (x86)\\Java',
        'C:\\Program Files\\Eclipse Adoptium',
        'C:\\Program Files\\Microsoft',
        'C:\\Program Files\\Zulu',
        'C:\\Program Files\\BellSoft'
      ];

      for (const root of standardRoots) {
        if (!fs.existsSync(root)) {
          continue;
        }

        try {
          const entries = fs.readdirSync(root, { withFileTypes: true });
          // Sort to pick highest / latest JDK version
          entries.sort((a, b) => b.name.localeCompare(a.name));

          for (const entry of entries) {
            if (entry.isDirectory()) {
              const candidate = path.join(root, entry.name, 'bin', 'javap.exe');
              if (fs.existsSync(candidate)) {
                return candidate;
              }
            }
          }
        } catch {
          // Continue
        }
      }
    } else if (process.platform === 'darwin') {
      // macOS standard paths
      const jvmRoot = '/Library/Java/JavaVirtualMachines';
      if (fs.existsSync(jvmRoot)) {
        try {
          const entries = fs.readdirSync(jvmRoot);
          for (const entry of entries) {
            const candidate = path.join(jvmRoot, entry, 'Contents', 'Home', 'bin', 'javap');
            if (fs.existsSync(candidate)) {
              return candidate;
            }
          }
        } catch {
          // Continue
        }
      }
    } else {
      // Linux standard paths
      const linuxRoots = ['/usr/lib/jvm', '/usr/java'];
      for (const root of linuxRoots) {
        if (fs.existsSync(root)) {
          try {
            const entries = fs.readdirSync(root);
            for (const entry of entries) {
              const candidate = path.join(root, entry, 'bin', 'javap');
              if (fs.existsSync(candidate)) {
                return candidate;
              }
            }
          } catch {
            // Continue
          }
        }
      }
    }

    return null;
  }
}

