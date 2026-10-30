# CLAUDE.md — Projet TaskFlow

Source : `docs/Seance1_Outils_IA_LLM_et_prompting.pdf` (module Outils IA, Bachelor 1, Ynov Toulouse, intervenant Pierre SCHIAVON). Ce fichier résume tout ce qu'il faut savoir : pas besoin de relire le PDF à chaque session.

## Le projet

TaskFlow est une mini-application web de gestion de tâches en HTML, CSS et JavaScript, construite en binôme avec l'aide de l'IA. C'est le fil rouge des 3 séances du module. Un seul dépôt GitHub par binôme, du début à la fin.

Filières du binôme : **Informatique** et **Cybersécurité**. On implémente les fonctionnalités de ces deux filières. La filière IA & Data (statistiques et graphique) n'est **pas** concernée : ne pas l'implémenter.

## Fonctionnalités de base (obligatoires)

- **Créer** : ajouter une tâche (titre, priorité, échéance). Refuser un titre vide.
- **Afficher** : voir toutes les tâches avec leur priorité et leur date.
- **Modifier** : changer le titre, la priorité ou la date d'une tâche existante.
- **Terminer** : cocher une tâche faite, elle apparaît barrée.
- **Supprimer** : retirer une tâche de la liste.
- **Sauvegarder** : retrouver ses tâches après fermeture du navigateur (`localStorage`).

### Interface attendue (maquette du cours)

1. Formulaire d'ajout : titre, priorité (liste déroulante), échéance (jj/mm/aaaa), bouton « Ajouter ».
2. Filtres : Toutes / À faire / Terminées.
3. Liste des tâches : priorité en couleur (Haute / Moyenne / Basse), date d'échéance.
4. Actions : case à cocher pour terminer, corbeille pour supprimer.

## Fonctionnalités filières (à implémenter)

### Informatique
- Trier les tâches par priorité ou par échéance.
- Filtrer par statut.
- Catégories avec une couleur : cours, perso, projet.
- Bonus : recherche par mot-clé.

### Cybersécurité
- Écran de connexion avant d'accéder aux tâches.
- Contrôle de robustesse du mot de passe : au moins 8 caractères, une majuscule, un chiffre, un caractère spécial.
- Jauge de robustesse : faible / moyen / fort.
- Bonus : blocage après 3 échecs de connexion.
- Mot de passe haché (SHA-256 avec l'API native `crypto.subtle.digest`) : ne jamais stocker le mot de passe en clair.
- Pas de serveur : la connexion est simulée côté navigateur (`localStorage`). Ne jamais stocker de vrai mot de passe ni de données personnelles réelles ; utiliser des comptes de test fictifs. Signaler dans le README les limites de sécurité d'une connexion uniquement côté client.

### Hors périmètre
- IA & Data (statistiques et graphique) : ne pas implémenter.

## Cadre technique (règles strictes)

Autorisé :
- HTML, CSS et JavaScript « vanilla », sans framework.
- `localStorage` pour la persistance.
- VS Code (ou Cursor) et GitHub.

Interdit :
- Pas de serveur ni de base de données.
- Pas de framework (React, Vue, Angular…).
- Pas de bibliothèque externe (l'exception du cours concerne seulement le graphique IA & Data, qu'on ne fait pas).
- Pas de données personnelles réelles dans l'application (données de test fictives uniquement).

## Structure de fichiers

```
taskflow/
├── src/
│   ├── index.html          # page unique : écran de connexion + écran des tâches
│   ├── css/
│   │   └── style.css       # mise en page, couleurs priorité/catégorie, tâche barrée, jauge
│   ├── assets/
│   │   ├── images/         # images de l'application (logo, illustrations)
│   │   └── icones/         # icônes de l'interface (corbeille, modifier, favicon…)
│   └── js/
│       ├── utils.js        # Utils : id, format de date, nettoyage des saisies
│       ├── storage.js      # Stockage : lecture / écriture JSON dans localStorage
│       ├── auth.js         # Auth : robustesse du mot de passe, hachage, connexion, blocage
│       ├── tasks.js        # Taches : validation, CRUD, filtre, tri, recherche (fonctions pures)
│       ├── ui.js           # Interface : tout l'accès au DOM (affichage, lecture du formulaire)
│       └── app.js          # point d'entrée : état, événements, orchestration
├── docs/                   # supports de cours (PDF)
├── CLAUDE.md
├── README.md               # cahier des charges + user stories (reste à la racine pour GitHub)
└── PROMPTS.md              # journal de prompts
```

Règles de structure (architecture validée par le binôme, voir PROMPTS.md, prompt 5) :
- Tout le code de l'application va dans `src/`. La documentation reste à la racine.
- Les images et icônes vont dans `src/assets/` et sont référencées par des chemins relatifs (ex. `assets/icones/corbeille.svg`). Fichiers locaux uniquement : pas de lien vers un CDN ni de bibliothèque d'icônes (Font Awesome, etc.). Préférer le SVG pour les icônes. Noms de fichiers en minuscules, sans espace ni accent.
- Un fichier JS = une responsabilité, et chaque fichier expose **un seul objet** : `Utils`, `Stockage`, `Auth`, `Taches`, `Interface`. Pas d'autre variable globale. Ne pas nommer un objet `Storage` (conflit avec `window.Storage`).
- Accès au DOM uniquement dans `ui.js`. Accès à `localStorage` uniquement dans `storage.js`. Règles métier uniquement dans `tasks.js` et `auth.js`.
- `tasks.js` contient des fonctions pures : elles reçoivent une liste et renvoient une nouvelle liste, sans modifier l'originale (trier une copie).
- Principe « état → affichage » : `app.js` garde l'état (tâches, filtre, tri, recherche, utilisateur connecté). Après chaque action : modifier l'état → sauvegarder → tout réafficher (une seule fonction `rafraichir`).
- Dépendances à sens unique : `app.js` → `Interface`, `Taches`, `Auth`, `Stockage` → `Utils`. `Taches`, `Auth` et `Stockage` ne s'appellent pas entre eux.
- Les validations renvoient un résultat (valide ou message d'erreur) ; seule `Interface` affiche les erreurs.
- Clics dans la liste : un seul écouteur sur le conteneur (délégation d'événements), la tâche est retrouvée par son id.
- Sécurité : afficher les textes saisis avec `textContent` / `createElement`, jamais `innerHTML` (XSS). Lecture de `localStorage` protégée par `try/catch`.
- Clés `localStorage` préfixées : `taskflow_tasks`, `taskflow_users`.
- Les scripts sont chargés avec des balises `<script>` classiques à la fin de `index.html`, dans l'ordre : `utils.js`, `storage.js`, `auth.js`, `tasks.js`, `ui.js`, puis `app.js`. Pas de `type="module"` : les modules ES ne marchent pas en ouvrant le fichier directement (`file://`), et le projet n'a pas de serveur.
- L'application s'ouvre en double-cliquant sur `src/index.html` (ou avec l'extension Live Server de VS Code).
- Ordre d'implémentation : sprint 1 = base (CRUD + sauvegarde), sprint 2 = Informatique (filtre, tri, catégories, recherche), sprint 3 = Cybersécurité (connexion, jauge, blocage).
- Décisions du sprint 2 (détail dans les critères d'acceptation du README) : tâches sans date à la fin du tri par échéance ; filtre, tri et recherche non sauvegardés ; après un ajout, filtre remis sur « Toutes » et recherche vidée ; recherche sensible aux accents (pas de `normalize`).

### Questions encore ouvertes (à trancher par le binôme, ne pas inventer)
1. Création du compte : écran d'inscription ou compte de test créé au premier lancement ?
2. Blocage après 3 échecs : durée et moyen de débloquer.
3. Session : se reconnecter à chaque rechargement, ou `sessionStorage` ? Bouton de déconnexion ?
4. Tâches propres à chaque utilisateur ou communes ?
5. Modèle utilisateur : à confirmer.
6. Description : présente dans le formulaire et modifiable ?
7. Échéance : obligatoire ? date passée acceptée ?
8. Modification : dans la liste, ou en réutilisant le formulaire d'ajout ?
9. README : ajouter les user stories des catégories et de la Cybersécurité.

## Modèle de données d'une tâche

Décision du binôme (PROMPTS.md, prompt 10) : les clés et les valeurs enregistrées sont **en anglais**. Le texte affiché à l'écran reste en français ; la traduction code → texte se fait dans `ui.js`.

```json
{
  "id": 1761818400000,
  "title": "Réviser le CSS",
  "description": "Flexbox",
  "priority": "high",
  "dueDate": "2026-11-15",
  "status": "todo",
  "category": "school"
}
```

- `priority` : `"high"` | `"medium"` | `"low"` (affiché Haute / Moyenne / Basse)
- `status` : `"todo"` | `"done"` (affiché À faire / Terminée)
- `dueDate` : date ISO `YYYY-MM-DD`, ou `""` si aucune (affichée jj/mm/aaaa)
- `category` (sprint 2) : `"school"` | `"personal"` | `"project"` (affiché Cours / Perso / Projet), ou `""` si aucune. Facultative, pas de catégorie par défaut.
- Correspondance avec le modèle du cours : `titre` → `title`, `priorite` → `priority`, `echeance` → `dueDate`, `statut` → `status`, `categorie` → `category`, `a_faire` → `todo`, `terminee` → `done`.
- Modèle utilisateur (Cybersécurité) : à définir avant le sprint 3, clés en anglais aussi. Toute modification du modèle est une décision du binôme.

## Planning et livrables

| Séance | Travail | À rendre |
|---|---|---|
| 1 — Comprendre et cadrer | Cadrer le projet avec l'IA : user stories, structure de fichiers, modèle de données | `README.md` (cahier des charges, user stories) et `PROMPTS.md` |
| 2 — Produire avec l'IA | Développer l'application en 3 sprints (Copilot, Cursor ou Claude) | Application fonctionnelle, **un commit par sprint**, `PROMPTS.md` à jour |
| 3 — Critiquer et défendre | Auditer le projet d'un autre groupe, corriger le sien, le présenter | Rapport d'audit, version finale du dépôt, oral de 10 min |

Exercice de la séance 1 :
1. Binôme et choix de la fonctionnalité filière (ici : Informatique + Cybersécurité).
2. User stories : 5 à 8, obtenues en **au moins 3 itérations**, format « En tant que… je veux… afin de… ».
3. Architecture : structure de fichiers et modèle de données, à critiquer.
4. Dépôt GitHub : `README.md` et `PROMPTS.md`.

## Format de PROMPTS.md

Pour chaque prompt important : le prompt exact, l'outil utilisé, ce qui a été gardé, ce qui a été modifié ou rejeté, et surtout pourquoi.

```markdown
## Prompt 3 · User stories (Claude)
**Prompt :** Tu es un développeur web…
**Résultat :** 8 user stories proposées
**Gardé :** 6 stories, reformulées
**Rejeté :** « synchronisation cloud », trop complexe pour notre niveau
**Pourquoi :** on reste sur localStorage
```

## Règles de travail pour Claude

- **L'IA propose, le binôme décide.** Présenter des propositions et des options, pas des décisions imposées. Signaler ce qui pourrait être refusé et pourquoi.
- **Niveau 1re année** : code simple, lisible, commenté en français, sans abstraction inutile. Expliquer les choix.
- **Respecter le périmètre** : ne pas ajouter de fonctionnalités non demandées (pas de cloud, pas de backend, pas de framework). Proposer les idées hors périmètre séparément, sans les implémenter.
- **Pas d'hallucination d'API** : n'utiliser que des API JavaScript standard qui existent vraiment (exemple du cours : `tasks.removeAll()` n'existe pas, utiliser `tasks = tasks.filter(t => !t.done)`). En cas de doute, le dire.
- **Lister les hypothèses** faites dans une réponse, et indiquer ce qui pourrait être faux (auto-critique).
- **Poser des questions d'abord** quand la demande est ambiguë.
- **Garder la trace** : après un échange important (user stories, architecture, sprint), rappeler d'ajouter une entrée dans `PROMPTS.md`, ou proposer le texte de l'entrée.
- **Commits** : un commit par sprint en séance 2, seulement quand le binôme le demande.
- Clés et valeurs des données (JSON, `localStorage`) en anglais, cohérentes avec le modèle de données ci-dessus. Commentaires, textes affichés et documentation en français.

## Rappels du cours sur les LLM (utile pour l'oral et le README)

- Un LLM prédit le token suivant le plus probable ; il ne vérifie pas. Fluide ≠ juste.
- Tokens : le texte est découpé en morceaux ; limites et prix se comptent en tokens.
- Fenêtre de contexte : tout ce que le modèle voit ; au-delà, le plus ancien est perdu ou résumé.
- Température : degré de hasard ; d'où des réponses différentes à la même question.
- Limites : hallucinations, biais, connaissances datées, réponses variables, sources inventées.
- Confiance : utiliser librement ce qui est facile à vérifier et sans gravité ; vérifier le code par des tests ; prudence sur les faits précis ; faire valider sécurité, juridique, santé et données personnelles.
- Les 6 briques d'un bon prompt : rôle, contexte, tâche, contraintes, format, exemples. Puis itérer (écrire → lire → repérer ce qui manque → préciser).
- Techniques : étape par étape, questions d'abord, hypothèses, auto-critique.

## Pour la séance 2

Activer GitHub Copilot (GitHub Student Developer Pack) et/ou installer Cursor. Apporter le dépôt TaskFlow.
