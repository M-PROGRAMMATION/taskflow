# Journal de prompts — TaskFlow

## Prompt 1 · Règles du projet dans CLAUDE.md (Claude Code)
**Prompt :** Je voudrais que tu fasses en sorte que, tu lises le pdf dans "/docs", il y a tout le cours dedans, que tu prennes en compte et que tu mettes toutes les règles et la description du projet dans le CLAUDE.md pour les règles qu'après sur chaque discussion qu'on a c'est bon, pas besoin de retourner à chaque fois.
**Résultat :** un CLAUDE.md qui résume le cours : fonctionnalités, cadre technique, modèle de données, planning, livrables, format de PROMPTS.md, règles de travail pour l'IA.
**Gardé :** tout le résumé du cours et les règles de travail.
**Modifié :** l'IA avait supposé que notre filière était IA & Data (à cause du nom du dossier `ia-data`). Corrigé au prompt 2.
**Pourquoi :** le fichier CLAUDE.md est relu automatiquement à chaque session, donc pas besoin de redonner le PDF à chaque fois.

## Prompt 2 · Choix des filières (Claude Code)
**Prompt :** On fait pas l'ia data, uniquement informatique et cybersécurité.
**Résultat :** CLAUDE.md mis à jour avec le détail des fonctionnalités Informatique (tri, filtres, catégories, recherche) et Cybersécurité (connexion, robustesse du mot de passe, jauge, blocage après 3 échecs).
**Gardé :** les deux listes de fonctionnalités, la règle « pas de bibliothèque externe ».
**À décider :** les pistes proposées par l'IA pour le modèle de données (champ `categorie`, modèle utilisateur avec mot de passe haché et compteur d'échecs).
**Pourquoi :** l'IA ne devait pas deviner notre filière ; on a rectifié son hypothèse.

## Prompt 3 · Structure des fichiers (Claude Code)
**Prompt :** Je voudrais juste changer la structure du code, car je trouve ça un peu moche perso, on peut mettre les fichiers dans un dossier "src", et faire un truc propre?
**Résultat :** une nouvelle structure avec tout le code dans `src/`, le CSS dans `src/css/` et le JavaScript découpé en `storage.js`, `auth.js`, `tasks.js`, `ui.js` et `app.js`.
**Gardé :** la nouvelle structure, à la place de celle du cours (`index.html`, `style.css` et `app.js` à la racine).
**Modifié :** README.md et PROMPTS.md restent à la racine pour que GitHub affiche le README.
**Rejeté :** les modules ES (`type="module"`), qui ne marchent pas quand on ouvre `index.html` par double-clic, et le projet n'a pas de serveur.
**Pourquoi :** un fichier par rôle, c'est plus lisible et plus facile à relire, et chacun du binôme peut travailler sur sa filière (`tasks.js` pour l'Informatique, `auth.js` pour la Cybersécurité) sans conflit.

## Prompt 4 · User stories (Claude Code)
**Prompt :** Tu es un développeur web expérimenté, spécialisé dans l'accompagnement d'étudiants en première année de Bachelor Informatique. Nous travaillons sur TaskFlow, une application web de gestion de tâches développée en HTML, CSS et JavaScript natif, sans framework ni bibliothèque externe. [Contexte : modèle de tâche (id, titre, description, priorité, échéance, statut), sauvegarde localStorage. Fonctionnalités : ajouter, afficher, modifier, terminer, supprimer, filtrer par statut, trier par priorité ou échéance, recherche par mot-clé en complément.] Ta mission : propose entre 5 et 8 User Stories au format « En tant que [utilisateur], je veux [action] afin de [bénéfice]. » Besoins précis, réalisables en 1re année, rien hors périmètre. Contraintes : HTML, CSS, JS natif, aucun framework, aucune API externe ni serveur, localStorage, pas de code, pas de fonctionnalités non demandées. Format : liste numérotée, puis une courte section séparée pour les fonctionnalités complémentaires recommandées.
**Résultat :** 8 user stories (ajouter, afficher, modifier, terminer, supprimer, sauvegarder, filtrer, trier) et la recherche par mot-clé dans une section complémentaire. Ajoutées au README.md.
**Gardé :** les 8 stories telles quelles ; la règle « titre vide refusé » (story 1) et « tâche terminée barrée » (story 4), qui viennent du cahier des charges du cours.
**Modifié :** la recherche par mot-clé est placée en fonctionnalité complémentaire, parce que le prompt la présente comme un bonus et limite la liste à 8 stories.
**Manquant :** le prompt ne mentionne ni les catégories colorées (Informatique) ni la partie Cybersécurité (connexion, robustesse du mot de passe, jauge, blocage). À traiter dans une prochaine itération du prompt.
**Pourquoi :** première itération sur les user stories ; le cours en demande au moins 3.

## Prompt 5 · Architecture (Claude Code)
**Prompt :**

```text
Tu es un architecte logiciel senior et développeur Full Stack expérimenté. Tu accompagnes des étudiants de première année de Bachelor Informatique dans la conception de leur première application web structurée.

1. Contexte

Nous travaillons sur TaskFlow, une application web de gestion de tâches.

Avant toute chose, tu dois impérativement lire et analyser intégralement le fichier CLAUDE.md situé à la racine du projet.

Ce fichier constitue la référence principale du projet. Il contient les informations, les objectifs, les contraintes et les consignes que tu dois respecter.

Ne fais aucune supposition sur les fonctionnalités qui ne sont pas documentées.

2. Ta mission

Ta mission est de concevoir une architecture logicielle complète pour TaskFlow.

Tu dois réfléchir à une architecture :

* Simple à comprendre pour des étudiants de première année.
* Organisée et cohérente.
* Facile à maintenir et à faire évoluer.
* Sans complexité inutile.
* Respectant les bonnes pratiques de développement.
* Adaptée aux technologies et contraintes définies dans CLAUDE.md.

3. Analyse préalable

Avant de proposer une architecture :

1. Lis CLAUDE.md intégralement.
2. Analyse les fichiers et dossiers déjà présents dans le dépôt.
3. Identifie les fonctionnalités attendues.
4. Identifie les contraintes techniques.
5. Repère les éventuelles incohérences ou informations manquantes.

Ne modifie aucun fichier pendant cette phase.

4. Conception de l'architecture

Propose une architecture qui sépare clairement les responsabilités.

Réfléchis notamment aux éléments suivants :

* Présentation : gestion de l'interface HTML et des interactions utilisateur.
* Logique métier : gestion des tâches, règles de validation et opérations.
* Données : gestion de la sauvegarde et de la récupération des tâches avec localStorage.
* Utilitaires : fonctions communes et réutilisables.

Évite de mélanger la manipulation du DOM, la logique métier et la persistance des données dans les mêmes fonctions.

Privilégie une architecture modulaire avec des responsabilités bien définies.

Ne mets pas en place de design pattern complexe s'il n'apporte pas de réelle valeur au projet.

5. Structure des fichiers

Propose une arborescence complète du projet.

Pour chaque fichier et dossier :

* Indique son rôle.
* Explique ce qu'il doit contenir.
* Précise ses responsabilités.
* Identifie ses éventuelles dépendances avec les autres modules.

La structure doit rester proportionnée à la taille du projet.

6. Modèle de données

Définis le modèle de données utilisé pour représenter une tâche.

Précise :

* Les propriétés nécessaires.
* Le type de chaque propriété.
* Les valeurs autorisées.
* Les règles de validation.
* La manière dont les données seront sauvegardées.

7. Flux de fonctionnement

Explique les principaux flux de l'application :

* Chargement initial de l'application.
* Récupération des tâches depuis localStorage.
* Création d'une tâche.
* Modification d'une tâche.
* Suppression d'une tâche.
* Changement de statut.
* Filtrage et tri des tâches.
* Sauvegarde des modifications.

Pour chaque flux, explique quels modules interviennent et dans quel ordre.

8. Bonnes pratiques

Respecte les principes suivants :

* Une responsabilité claire par module.
* Éviter la duplication de code.
* Favoriser les fonctions courtes et compréhensibles.
* Utiliser des noms explicites.
* Limiter les dépendances entre modules.
* Centraliser les règles métier.
* Gérer les erreurs de manière cohérente.
* Éviter les variables globales inutiles.
* Ne pas surarchitecturer une application de cette taille.

9. Contraintes

Respecte impérativement les contraintes définies dans CLAUDE.md.

En particulier, le projet utilise HTML, CSS et JavaScript natif, sans framework.

N'ajoute aucune dépendance externe sans justification et validation préalable.

Ne développe aucune fonctionnalité supplémentaire qui ne fait pas partie du périmètre défini.

10. Livrables attendus

Présente ton travail dans cet ordre :

1. Synthèse de ta compréhension du projet.
2. Analyse des contraintes techniques.
3. Proposition d'architecture et justification des choix.
4. Arborescence complète des fichiers.
5. Description détaillée du rôle de chaque module.
6. Modèle de données.
7. Schéma des dépendances entre modules.
8. Explication des principaux flux de fonctionnement.
9. Ordre recommandé d'implémentation.
10. Risques techniques et points de vigilance.

11. Règles de travail

IMPORTANT :

* Ne génère aucun code pour le moment.
* Ne crée, ne supprime et ne modifie aucun fichier.
* Ne commence pas l'implémentation.
* Ne prends aucune décision structurante sans expliquer pourquoi.
* Si plusieurs architectures sont envisageables, compare-les et recommande la plus adaptée.
* Si une information manque dans CLAUDE.md, signale-le plutôt que d'inventer une réponse.

À la fin, présente une architecture complète que nous pourrons valider avant de passer à l'implémentation.
```

**Résultat :** comparaison de 3 architectures (un seul `app.js` / un fichier par rôle avec scripts classiques / modules ES ou MVC). Recommandation : un fichier par rôle, chacun exposant un seul objet (`Utils`, `Stockage`, `Auth`, `Taches`, `Interface`), et `app.js` qui garde l'état avec la boucle « modifier l'état → sauvegarder → réafficher ». Le reste : modèle tâche + utilisateur, schéma des dépendances, flux, ordre des 3 sprints, risques (XSS, fausse sécurité côté client, hachage asynchrone, JSON corrompu, tri qui modifie la liste, ordre des scripts, noms globaux) et 9 questions ouvertes.
**Gardé :** l'architecture complète, validée par le binôme. Ajout du fichier `utils.js`, que la structure de départ ne prévoyait pas. CLAUDE.md mis à jour et squelette des fichiers créé dans `src/`.
**Rejeté :** l'architecture en un seul `app.js` (tout est mélangé, conflits entre nous deux) et les modules ES ou MVC (ne marchent pas en `file://`, trop complexes pour la taille du projet).
**À décider :** les 9 questions ouvertes (création du compte, durée du blocage, session, tâches par utilisateur, catégorie, description, échéance, mode de modification, user stories manquantes), notées dans CLAUDE.md.
**Pourquoi :** une architecture simple mais séparée en rôles clairs ; les points non documentés sont signalés plutôt qu'inventés par l'IA.

## Prompt 6 · Dossier des ressources (Claude Code)
**Demande d'origine :** je voudrais que tu fasses un dossier "assets" contenant les images, etc. du projet.
**Prompt (version structurée) :**

```text
Tu es un développeur web qui accompagne des étudiants de 1re année.
Contexte : TaskFlow, application de tâches en HTML, CSS et JavaScript natif, sans framework ni bibliothèque externe, ouverte en double-cliquant sur src/index.html (pas de serveur). L'architecture est décrite dans CLAUDE.md.
Tâche : ajoute à l'architecture un dossier pour les ressources statiques (images, icônes).
Contraintes : respecter la structure existante (tout le code dans src/), uniquement des fichiers locaux, aucune dépendance externe, pas de fonctionnalité en plus.
Format : l'arborescence mise à jour et les règles d'utilisation (emplacement, chemins, nommage), sans code.
```

**Résultat :** un dossier `src/assets/` avec deux sous-dossiers, `images/` (logo, illustrations) et `icones/` (corbeille, modifier, favicon). Les règles sont ajoutées dans CLAUDE.md : chemins relatifs, fichiers locaux, SVG pour les icônes, noms en minuscules sans espace ni accent.
**Gardé :** `src/assets/` avec `images/` et `icones/`. Un fichier `.gitkeep` dans chaque dossier, parce que Git ne suit pas les dossiers vides.
**Rejeté :** utiliser une bibliothèque d'icônes en ligne (Font Awesome ou Bootstrap Icons, chargée depuis un CDN) au lieu de fichiers locaux.
**Pourquoi :** CLAUDE.md interdit toute bibliothèque externe, et l'application ne doit dépendre d'aucune connexion internet. Quelques icônes SVG locales suffisent pour une todo-list.

## Prompt 7 · User stories, 2e itération : découpage en 3 sprints (Claude Code)
**Prompt :** Et du coup dans le README.md et dans le PROMPTS.md, modifie et fait le User Storie, pour les 3 sprints.
**Contexte :** l'IA venait d'expliquer le découpage des sprints (sprint 1 = base, sprint 2 = Informatique, sprint 3 = Cybersécurité) et avait signalé que la 1re itération (prompt 4) oubliait les catégories et toute la Cybersécurité.
**Résultat :** 15 user stories rangées par sprint dans le README : 6 pour la base, 4 pour l'Informatique (dont la recherche en bonus), 5 pour la Cybersécurité (dont le blocage en bonus).
**Gardé :** les 8 stories de la 1re itération, légèrement reformulées (priorité en couleur, icône corbeille). Ajoutées : catégories colorées, connexion, robustesse du mot de passe, jauge, mot de passe haché, blocage après 3 échecs.
**Modifié :** la description a été retirée de la story « modifier » pour coller au cahier des charges du cours (titre, priorité, date). La recherche passe du titre ou de la description au titre seul. Elle n'est plus une fonctionnalité complémentaire à part mais le bonus du sprint 2.
**Rejeté :** une story « créer un compte » : le cours ne parle que d'un écran de connexion, et le mode de création du compte n'est pas encore décidé.
**Pourquoi :** chaque sprint a maintenant ses user stories, et ce sont elles qui servent à vérifier que le sprint est terminé. Le cours demande au moins 3 itérations sur les user stories : celle-ci est la 2e.

## Prompt 8 · Mise en ligne avec GitHub Pages (Claude Code)
**Prompt :** Vu que je publish sur github, il y a un moyen de publish le site directement non avec github.app.io ou un truc du genre non?
**Résultat :** l'IA propose GitHub Pages (adresse : https://m-programmation.github.io/taskflow/). Problème signalé : en mode « Deploy from a branch », Pages ne publie que la racine du dépôt ou le dossier `/docs`, alors que notre application est dans `src/` et que `docs/` contient le PDF du cours. Solution proposée : un workflow GitHub Actions (`.github/workflows/page.yml`) qui publie uniquement le dossier `src/` à chaque push sur `main`, puis dans les réglages du dépôt, Settings → Pages → Source : « GitHub Actions ».
**Gardé :** le workflow tel quel, et la règle de ne publier que `src/` (ni le README, ni les PDF du cours).
**Rejeté :** déplacer l'application à la racine ou dans `docs/` pour utiliser le mode simple. Ça casserait l'architecture validée au prompt 5.
**Problème rencontré :** VS Code affichait « Value 'github-pages' is not valid » sur la ligne `environment`. L'IA a expliqué que c'est un avertissement de l'extension GitHub Actions : l'environnement `github-pages` n'existe pas encore sur le dépôt. GitHub le crée lui-même quand on choisit « GitHub Actions » comme source de Pages. Il ne faut pas supprimer ce bloc, `actions/deploy-pages` en a besoin.
**Points de vigilance :** le site devient public, donc comptes de test fictifs uniquement, et il faudra signaler dans le README les limites de la connexion côté client. Le `localStorage` est partagé par tous les sites `m-programmation.github.io`, d'où les clés préfixées `taskflow_`. Le serveur fait la différence entre majuscules et minuscules dans les noms de fichiers, d'où la règle des noms en minuscules.
**Pourquoi :** GitHub Pages ne sert que des fichiers statiques. Le site respecte donc toujours la règle « pas de serveur ni de base de données », et on peut montrer l'application à l'oral sans l'installer.

## Prompt 9 · User stories, 3e itération : critères d'acceptation et modèle de données (Claude Code)
**Prompt :** Dans le Sprint 1, c'est bien, mais je pense qu'on peut aller plus loin encore, c'est pas assez affiné. Et en plus il manque le "Modèle de données d'une tâche", qui faudrait lui aussi mettre dans le README.md. Prend exemple sur des applications comme Trello, qui lui fait des Todo-List, pour des idées.
**Résultat :** les stories du sprint 1 ont maintenant des critères d'acceptation (cas d'erreur, message de liste vide, compteur, confirmation avant suppression, touche Entrée et Échap, données illisibles). Une story « repérer les échéances proches » est ajoutée, inspirée des badges de date de Trello. Le README a une nouvelle section « Modèle de données d'une tâche » : tableau des champs (type, valeurs autorisées, règles), format de sauvegarde dans `localStorage`. Un tableau liste les autres idées tirées de Trello, avec un avis pour chacune.
**Hors périmètre :** plusieurs tableaux, membres, commentaires, notifications (il faudrait un serveur) ; checklists et colonnes avec glisser-déposer (trop loin du cahier des charges du cours).
**Pourquoi :** une story sans critères d'acceptation ne dit pas quand elle est terminée. Avec la liste de vérifications, on peut tester chaque sprint avant le commit. 3e itération sur les user stories, comme le demande le cours.

## Prompt 10 · Données en anglais (Claude Code)
**Prompt :** Il faut que tout le taskflow_taches, le json passe en anglais, et qu'on est pas des keys comme "titre".
**Résultat :** les clés et les valeurs du modèle de tâche passent en anglais : `title`, `description`, `priority` (`high` / `medium` / `low`), `dueDate`, `status` (`todo` / `done`), `category` (`school` / `personal` / `project`). Les clés `localStorage` deviennent `taskflow_tasks` et `taskflow_users`. README.md, CLAUDE.md et le commentaire de `storage.js` sont mis à jour. Le texte affiché à l'écran reste en français ; `ui.js` fera la traduction (ex. `"high"` → « Haute »).
**Pourquoi :** des clés en anglais suivent les conventions habituelles du JavaScript (camelCase, `task.dueDate`). On sépare les codes internes, qui ne changent pas, du texte affiché, qui reste en français. Le modèle du cours (`titre`, `priorite`…) est donc adapté : c'est une décision du binôme, notée dans CLAUDE.md.

## Prompt 11 · User stories du sprint 2 : critères d'acceptation (Claude Code)
**Prompt :** comme le sprint 1 à deja été fait, je souhaite que tu affines le sprit 2
**Résultat :** critères d'acceptation pour les stories 8 à 11, règles communes au filtre, au tri et à la recherche, et 5 points à trancher.
**Gardé :** tâches sans date à la fin du tri, filtre et tri non conservés, retour sur « Toutes » et recherche vidée après un ajout.
**Modifié :** la catégorie devient facultative (`""` si aucune), alors que l'IA proposait « Cours » par défaut. Le modèle de données est mis à jour.
**Rejeté :** ignorer les accents dans la recherche avec `normalize`.
**Pourquoi :** comme au sprint 1, les critères disent quand une story est terminée. Ils ont aussi révélé une contradiction avec la story 4 et le cas des tâches sans catégorie. Une catégorie imposée par défaut classerait des tâches au hasard, d'où le choix de la laisser vide. `normalize` a été rejeté pour garder une recherche simple.

## Prompt 12 · User stories du sprint 3 : critères d'acceptation (Claude Code)
**Prompt :** maintenant fais pareil pour le sprint 3
**Résultat :** critères d'acceptation pour les stories 12 à 16, modèle utilisateur, section sur les limites de sécurité d'une connexion côté client, et 7 points à trancher.
**Gardé :** le modèle utilisateur, la jauge (Fort avec les 4 règles), le refus des messages qui révèlent si un compte existe.
**Modifié :** le blocage passe de 1 minute à 20 secondes. La session reste active au rechargement avec `sessionStorage`. Une lettre accentuée ne compte pas comme caractère spécial.
**Rejeté :** l'écran d'inscription et les tâches propres à chaque utilisateur (clé `owner`).
**Pourquoi :** un seul compte de test suffit pour une application de démonstration sans serveur, et on garde un modèle de tâche inchangé. Les critères ont aussi montré que les stories 13 et 14 avaient besoin d'un écran pour choisir le mot de passe, d'où l'écran du premier lancement, encore à valider.
