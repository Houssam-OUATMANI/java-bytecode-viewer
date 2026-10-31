# Java Bytecode Viewer (VS Code Extension)

Extension VS Code inspirée d'IntelliJ IDEA Ultimate permettant d'explorer et de visualiser le bytecode compilé de vos projets Java.

## Fonctionnalités

* **Activation ciblée** : S'active automatiquement dès qu'un projet Java est détecté (`pom.xml`, `build.gradle`, `.java`).
* **Barre d'activité dédiée** : Icône dans l'Activity Bar avec un explorateur des classes compilées (`target/classes`, `build/classes`, `bin`, multi-modules supportés).
* **Regroupement intelligent des packages & classes internes** :
  * Compacte les packages intermédiaires (ex: `com.example.service`).
  * Regroupe les classes internes et anonymes (`App$Builder.class`, `App$1.class`) comme enfants pliables sous leur classe mère (`App.class`).
* **Visualisation Read-Only instantanée** :
  * Ouvre le bytecode via un document virtuel `javabytecode://` protégé en écriture.
  * **Cache mémoire intelligent** basé sur le `mtime` des fichiers pour un affichage instantané sans latence JVM.
* **Boutons de bascule rapide (Toggles dans l'éditeur)** :
  * `$(list-tree)` **Toggle Verbose** : Masque ou affiche à la volée le Constant Pool et les Stack Maps.
  * `$(eye)` **Toggle Private Members** : Affiche ou masque les méthodes et champs privés (`-p`).
  * `$(list-ordered)` **Toggle Line Numbers** : Affiche ou masque les tables de numéros de ligne et variables locales (`-l`).
* **Synchronisation Code $\leftrightarrow$ Bytecode (Navigation au curseur)** :
  * En déplaçant le curseur dans le fichier source `.java`, l'éditeur de bytecode sélectionne et scrolle automatiquement sur l'instruction d'offset correspondante.
* **Navigation par Plan (Outline & Breadcrumbs)** :
  * Arborescence des symboles dans le panneau *Outline* de VS Code (Constant Pool, constructeurs `<init>`, méthodes, champs).
* **Liens cliquables dans le Bytecode** :
  * Cliquez sur n'importe quelle référence `#15` dans le code ou le Constant Pool pour sauter directement à sa définition.
* **Auto-refresh** : Surveillance des fichiers `.class` en temps réel pour recharger automatiquement l'arborescence et le bytecode affiché après chaque recompilation.
* **Détection automatique du JDK** : Détecte automatiquement l'exécutable `javap` (`JAVA_HOME`, standard JDK sous Windows/Linux/macOS).

## Commandes & Raccourcis

* `Java: Show Bytecode` : Ouvrir le bytecode correspondant au fichier `.java` actif en *Split View*.
* `Refresh Classes` : Forcer le rafraîchissement de l'arborescence et vider le cache.

## Configuration

* `javaBytecode.javapPath` : Chemin personnalisé vers `javap` (si vide, auto-détecté).
* `javaBytecode.verbose` : Affiche le Constant Pool et les Stack Maps (`-v`, par défaut : `true`).
* `javaBytecode.showPrivateMembers` : Affiche les membres privés (`-p`, par défaut : `true`).
* `javaBytecode.showLineAndLocalVariableTables` : Affiche les tables de numéros de ligne et variables locales (`-l`, par défaut : `true`).
* `javaBytecode.autoSyncCursor` : Active le défilement synchronisé entre le code `.java` et le bytecode (`true` par défaut).
* `javaBytecode.outputDirectories` : Motifs glob des répertoires compilés à analyser.

## Lancement & Développement

```bash
bun install
bun run build
```
Puis appuyez sur **F5** dans VS Code pour démarrer l'Extension Development Host.
