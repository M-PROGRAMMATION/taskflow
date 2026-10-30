# Journal de prompts — TaskFlow

## Prompt 1 · Règles du projet dans CLAUDE.md (Claude Code)
**Prompt :** Je voudrais que tu fasses en sorte que, tu lises le pdf dans "/docs", il y a tout le court dedans, que tu prennes en compte et que tu mettes toutes les règles et la description du projet dans le CLAUDE.md pour les règles qu'après sur chaque discussion qu'on a c'est bon, pas besoin de retourner à chaque fois.
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
