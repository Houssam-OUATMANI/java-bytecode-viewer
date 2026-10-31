# Java Bytecode Viewer (VS Code Extension)

Extension VS Code inspirée d'IntelliJ IDEA Ultimate permettant d'explorer et de visualiser le bytecode compilé de vos projets Java.

## Fonctionnalités

* **Activation ciblée** : S'active automatiquement dès qu'un projet Java est détecté (`pom.xml`, `build.gradle`, `.java`).
* **Barre d'activité dédiée** : Icône dans l'Activity Bar avec un explorateur des classes compilées (`target/classes`, `build/classes`, `bin`, etc.).
* **Regroupement intelligent des packages** : Compacte les dossiers intermédiaires (ex: `com.example.service`) comme dans IntelliJ IDEA.
* **Visualisation Read-Only** : Ouvre le bytecode via un document virtuel `javabytecode://` protégé en écriture.
* **Coloration syntaxique complète** : Opcodes JVM, constantes, sections de pool, tables de variables locales, sauts conditionnels.
* **Auto-refresh** : Surveillance des fichiers `.class` en temps réel pour recharger automatiquement l'arborescence et le bytecode affiché après recompilation (`mvn compile`, `gradle build`).
* **Bouton « Show Bytecode » dans l'éditeur** : Ouvrez directement le bytecode correspondant à votre fichier `.java` actif en affichage fractionné (*Split View*).
* **Détection automatique du JDK** : Détecte automatiquement l'exécutable `javap` (`JAVA_HOME`, standard JDK sous Windows/Linux/macOS).

## Configuration

Dans vos paramètres VS Code (`settings.json`) :

* `javaBytecode.javapPath` : Chemin personnalisé vers `javap` (si vide, auto-détecté).
* `javaBytecode.verbose` : Affiche le Constant Pool et les Stack Maps (`-v`, par défaut : `true`).
* `javaBytecode.showPrivateMembers` : Affiche les méthodes et champs privés (`-p`, par défaut : `true`).
* `javaBytecode.showLineAndLocalVariableTables` : Affiche les tables de numéros de ligne et variables locales (`-l`, par défaut : `true`).
* `javaBytecode.outputDirectories` : Motifs glob des répertoires compilés à analyser.

## Lancement & Développement

1. Installer les dépendances :
   ```bash
   bun install
   ```

2. Compiler :
   ```bash
   bun run build
   ```

3. Appuyer sur **F5** dans VS Code pour démarrer la fenêtre d'extension de test (*Extension Development Host*).

