# TaskFlow

Application web de gestion de tâches en HTML, CSS et JavaScript natif, sans framework ni bibliothèque externe. Les données sont sauvegardées dans le navigateur avec `localStorage`.

Filières du binôme : Informatique et Cybersécurité.

## Lancer l'application

Ouvrir `src/index.html` par double-clic (ou avec l'extension Live Server de VS Code). Aucune installation n'est nécessaire.

## Avancement

Chaque fonctionnalité est développée sur sa propre branche `feature/...`, créée depuis la branche du sprint (`sprint1`, `sprint2`…), puis fusionnée dans cette branche. La branche du sprint n'est fusionnée dans `main` que quand le binôme l'a validée. Une case cochée = fusionnée dans le sprint. Le détail est coché dans les critères d'acceptation des user stories, plus bas.

### Sprint 1 · La base (branche `sprint1`)

- [x] `feature/utils-stockage` : objets `Utils` (id, date, nettoyage) et `Stockage` (lecture / écriture protégée de `localStorage`)
- [x] `feature/afficher-taches` : liste, badges de priorité et d'échéance, compteur, message de liste vide (stories 2 et 3)
- [x] `feature/ajouter-tache` : formulaire d'ajout et validation du titre (story 1)
- [x] `feature/terminer-tache` : case à cocher, tâche barrée (story 5)
- [x] `feature/supprimer-tache` : corbeille avec confirmation (story 6)
- [x] `feature/modifier-tache` : modification directement dans la liste (story 4)
- [x] Sauvegarde après chaque action et démarrage avec des données abîmées (story 7), vérifiée sur toutes les features
- [x] `feature/retours-binome-sprint1` : modification enregistrée avant toute autre action, compteur « 0 tâche(s) à faire », nouvelle organisation Git dans CLAUDE.md

**Vérification du sprint 1** : les fonctions pures (`Utils`, `Stockage`, `Taches`) ont été testées avec Node, puis l'application complète dans Chrome, avec un script qui simule les actions : ajout, titre vide, HTML dans le titre, cocher et décocher, modification avec Annuler, Échap et titre vide, suppression avec et sans confirmation, rechargement de la page, données abîmées dans `localStorage`. Les 37 vérifications passent. Reste à faire à la main par le binôme : un test sur Firefox et Safari, et sur le site GitHub Pages.

### Sprint 2 · Informatique (branche `sprint2`)

- [x] `feature/categories` : catégorie facultative (Cours, Perso, Projet) à l'ajout et à la modification, badge en couleur (story 10)
- [x] `feature/filtrer-statut` : filtres Toutes / À faire / Terminées (story 8)
- [x] `feature/trier-taches` : tri par date d'ajout, priorité ou échéance (story 9)
- [x] `feature/rechercher-tache` : recherche par mot-clé dans le titre (story 11, bonus)
- [x] `feature/bilan-sprint2` : règles communes aux stories 8, 9 et 11, note de vérification, entrée de PROMPTS.md

**Vérification du sprint 2** : les nouvelles fonctions pures de `Taches` (`filtrerParStatut`, `trier`, `rechercher`, validation de la catégorie) ont été testées avec Node (31 vérifications), puis l'application complète dans Chrome, avec un script qui simule les actions : catégories à l'ajout et à la modification, couleurs des badges, tâches enregistrées avant le sprint 2, chaque filtre et ses messages, chaque tri et les égalités, recherche (casse, accents, espaces, HTML dans le mot-clé), combinaison des trois, retour sur « Toutes » après un ajout, et modification en cours pendant un changement de filtre, de tri ou de recherche. Les 68 vérifications passent. Reste à faire à la main par le binôme : un rechargement (F5) sur Firefox et Safari pour vérifier qu'on repart bien de « Toutes », « Plus récentes » et d'une recherche vide, et un essai sur téléphone.

### Sprint 3 · Cybersécurité (branche `sprint3`)

- [x] `feature/auth-stockage` : objet `Auth` (règles du mot de passe, hachage SHA-256, comptes) et `Stockage` des comptes (`taskflow_users`) et de la session (`taskflow_session`)
- [x] `feature/connexion` : écran du premier lancement (choix du mot de passe), écran de connexion, session, bouton « Se déconnecter » (stories 12, 13 et 15)
- [x] `feature/jauge-robustesse` : jauge Faible / Moyen / Fort pendant la saisie du mot de passe (story 14)
- [ ] `feature/blocage-connexion` : blocage de 20 secondes après 3 échecs (story 16, bonus)
- [ ] `feature/bilan-sprint3` : note de vérification, entrée de PROMPTS.md

## Modèle de données d'une tâche

Une tâche est un objet JavaScript. Les clés et les valeurs enregistrées sont en anglais ; seul le texte affiché à l'écran est en français. Exemple :

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

| Clé | Type | Valeurs autorisées | Affiché à l'écran | Règles | Origine |
|---|---|---|---|---|---|
| `id` | nombre | unique | — | Généré à la création par `Utils`, jamais modifié. Sert à retrouver la tâche quand on clique dessus. | Cours |
| `title` | texte | 1 à 100 caractères | le titre | Obligatoire. Espaces retirés au début et à la fin. Maximum de 100. | Cours |
| `description` | texte | libre, `""` par défaut | la description | Facultative. Affichage et modification. | Cours |
| `priority` | texte | `"high"`, `"medium"`, `"low"` | Haute, Moyenne, Basse | Toute autre valeur est refusée. | Cours |
| `dueDate` | texte | date `"YYYY-MM-DD"`, ou `""` si aucune | jj/mm/aaaa | Stockée au format ISO. Obligatoire ou non. | Cours |
| `status` | texte | `"todo"`, `"done"` | À faire, Terminée | Vaut `"todo"` à la création. | Cours |
| `category` | texte | `"school"`, `"personal"`, `"project"`, ou `""` si aucune | Cours, Perso, Projet, ou rien si aucune | Ajouté au sprint 2. Facultative : `""` par défaut. | Proposé (filière Informatique) |

Pourquoi ces choix :
- **Données en anglais, affichage en français** : les clés et les valeurs sont des codes internes, sans accent ni espace (`"done"` et non `"Terminée"`), donc pas de faute de frappe possible. C'est `ui.js` qui traduit chaque code en texte français pour l'écran.
- **Clés en camelCase** (`dueDate`) : c'est la convention habituelle en JavaScript, on écrit `task.dueDate`.
- **Date au format ISO** (`2026-11-15`) : deux dates ISO se comparent comme du texte (`"2026-11-15" < "2026-12-01"`), ce qui rend le tri par échéance et la détection des retards simples. Le format jj/mm/aaaa ne sert qu'à l'affichage.
- **`id` en nombre** : par exemple `Date.now()`, l'heure de création en millisecondes *(hypothèse : deux tâches créées dans la même milliseconde auraient le même id, ce qui est impossible avec un seul clic)*.

### Sauvegarde

Toutes les tâches sont rangées dans un tableau, enregistré en JSON dans `localStorage` sous la clé `taskflow_tasks` :

```json
[
  { "id": 1761818400000, "title": "Réviser le CSS", "description": "", "priority": "high", "dueDate": "2026-11-15", "status": "todo", "category": "school" },
  { "id": 1761818460000, "title": "Faire les courses", "description": "", "priority": "low", "dueDate": "", "status": "done", "category": "personal" }
]
```

- Le tableau entier est réécrit après chaque action (`JSON.stringify` puis `localStorage.setItem`).
- La lecture (`localStorage.getItem` puis `JSON.parse`) est protégée par `try/catch` : si les données sont illisibles, on repart d'un tableau vide.
- Le modèle utilisateur est décrit avec le sprint 3. Il est enregistré sous la clé `taskflow_users`, avec des clés en anglais lui aussi.

## User Stories

Chaque story a des **critères d'acceptation** : la liste des vérifications à faire pour dire que la story est terminée. Une mention signale une proposition qui n'est pas encore décidée par le binôme.

### Sprint 1 · La base

**1. Ajouter une tâche**
En tant qu'utilisateur, je veux ajouter une tâche en renseignant son titre, sa priorité et sa date d'échéance afin de noter ce que j'ai à faire.
- [x] Le formulaire contient un champ titre, un champ description, une liste déroulante priorité (Haute, Moyenne, Basse), un sélecteur de date pour l'échéance et un bouton « Ajouter ».
- [x] La description est facultative : laissée vide, elle est enregistrée comme `""`.
- [x] L'échéance est facultative. Une date déjà passée est acceptée : la tâche affiche alors le badge « En retard » (story 3).
- [x] Un titre vide ou composé uniquement d'espaces est refusé : un message d'erreur s'affiche sous le champ et aucune tâche n'est créée.
- [x] Les espaces au début et à la fin du titre sont retirés avant l'enregistrement.
- [x] Le titre fait au maximum 100 caractères.
- [x] La priorité est « Moyenne » par défaut.
- [x] La touche Entrée valide le formulaire, comme le bouton « Ajouter ».
- [x] Après l'ajout, la tâche apparaît dans la liste avec le statut « à faire », le formulaire est vidé et le curseur revient dans le champ titre.
- [x] Un titre contenant du HTML (ex. `<b>test</b>`) s'affiche tel quel, en texte, sans être interprété.

**2. Voir toutes ses tâches**
En tant qu'utilisateur, je veux voir la liste de toutes mes tâches avec leur titre, leur priorité et leur échéance afin d'avoir une vue d'ensemble de mon travail.
- [x] Chaque tâche affiche : une case à cocher, son titre, un badge de priorité, son échéance au format jj/mm/aaaa, un bouton modifier et un bouton corbeille.
- [x] Le badge de priorité a une couleur (Haute : rouge, Moyenne : orange, Basse : vert) **et** contient le mot, pour rester lisible sans distinguer les couleurs.
- [x] Une tâche sans échéance affiche « Sans date ».
- [x] Les tâches les plus récentes apparaissent en haut de la liste.
- [x] Quand la liste est vide, un message l'indique : « Aucune tâche pour le moment. Ajoutez-en une avec le formulaire. »
- [x] Un compteur indique le nombre de tâches restantes, par exemple « 3 tâches à faire », « 1 tâche à faire » au singulier, et « 0 tâche(s) à faire » quand il n'en reste aucune.

**3. Repérer les échéances proches**
En tant qu'utilisateur, je veux voir au premier coup d'œil les tâches en retard ou à faire aujourd'hui afin de ne pas rater une échéance.
- [x] Une tâche à faire dont l'échéance est dépassée affiche un badge rouge « En retard ».
- [x] Une tâche à faire dont l'échéance est aujourd'hui affiche un badge orange « Aujourd'hui ».
- [x] Une tâche terminée n'affiche jamais de badge de retard.
- [x] La comparaison se fait sur la date du jour, sans tenir compte de l'heure.
- [x] Une échéance passée n'est jamais refusée, ni à l'ajout ni à la modification : le badge « En retard » sert d'avertissement.

**4. Modifier une tâche**
En tant qu'utilisateur, je veux modifier le titre, la description, la priorité ou l'échéance d'une tâche existante afin de corriger une erreur ou de tenir compte d'un changement.
- [x] Le bouton modifier (crayon) ouvre la modification directement dans la liste : la ligne de la tâche devient un petit formulaire (titre, description, priorité, échéance), avec les valeurs actuelles déjà remplies. Le formulaire d'ajout ne change pas.
- [x] Les règles de l'ajout s'appliquent aussi : un titre vide est refusé avec un message d'erreur.
- [x] Un bouton « Enregistrer » valide les changements ; un bouton « Annuler » (ou la touche Échap) referme sans rien changer.
- [x] Une seule tâche peut être en cours de modification à la fois.
- [x] Une autre action faite pendant une modification (cocher, supprimer, ajouter, ouvrir une autre tâche) enregistre d'abord la modification en cours. Si le titre saisi est refusé, l'erreur s'affiche et l'autre action n'est pas faite. Seuls « Annuler » et Échap referment sans enregistrer.
- [x] La modification ne change ni l'identifiant, ni le statut, ni la place de la tâche dans la liste.

**5. Terminer une tâche**
En tant qu'utilisateur, je veux cocher une tâche pour la marquer comme terminée afin de voir clairement ce que j'ai déjà accompli.
- [x] Cocher la case passe la tâche au statut « terminée » : son titre apparaît barré et grisé.
- [x] Décocher la case la remet « à faire », pour corriger un clic par erreur.
- [x] Le compteur de tâches restantes se met à jour tout de suite.

**6. Supprimer une tâche**
En tant qu'utilisateur, je veux supprimer une tâche avec l'icône corbeille afin de retirer de ma liste celles qui ne sont plus utiles.
- [x] Un clic sur la corbeille demande une confirmation qui rappelle le titre : « Supprimer la tâche « Réviser le CSS » ? ».
- [x] Si l'utilisateur annule, rien ne change.
- [x] Si l'utilisateur confirme, la tâche disparaît de la liste et le compteur se met à jour.
- [x] La suppression est définitive : il n'y a pas de corbeille pour récupérer une tâche.

**7. Retrouver ses tâches**
En tant qu'utilisateur, je veux retrouver mes tâches après avoir fermé puis rouvert mon navigateur afin de ne pas perdre mon travail.
- [x] Chaque action (ajout, modification, case cochée, suppression) est sauvegardée immédiatement, sans bouton « Enregistrer » global.
- [x] Après fermeture et réouverture du navigateur, on retrouve les mêmes tâches, avec le même statut et dans le même ordre.
- [x] Si les données sauvegardées sont illisibles (abîmées ou modifiées à la main), l'application démarre quand même, avec une liste vide, sans planter.
- [x] Limite connue : les tâches sont liées à ce navigateur sur cet appareil. Elles ne sont pas visibles depuis un autre ordinateur, et vider les données du site les efface.

### Sprint 2 · Informatique

**8. Filtrer par statut**
En tant qu'utilisateur, je veux filtrer mes tâches par statut (toutes, à faire, terminées) afin de me concentrer sur ce qui reste à faire.
- [x] Trois boutons sont affichés au-dessus de la liste : « Toutes », « À faire », « Terminées ». Le filtre actif est mis en évidence.
- [x] Le filtre « Toutes » est actif à l'ouverture de l'application.
- [x] Un clic sur un filtre met la liste à jour tout de suite, sans recharger la page.
- [x] Filtrer ne supprime rien : en revenant sur « Toutes », toutes les tâches sont là.
- [x] Une tâche cochée pendant que le filtre « À faire » est actif disparaît aussitôt de la liste. De même, une tâche décochée disparaît du filtre « Terminées ».
- [x] Le compteur de la story 2 compte toujours toutes les tâches à faire, quel que soit le filtre.
- [x] Si le filtre ne donne aucun résultat, un message l'indique : « Aucune tâche à faire. » ou « Aucune tâche terminée. ». Le message de la story 2 reste réservé au cas où il n'existe aucune tâche.

**9. Trier les tâches**
En tant qu'utilisateur, je veux trier mes tâches par priorité ou par date d'échéance afin de savoir quoi faire en premier.
- [x] Une liste déroulante « Trier par » propose : « Plus récentes », « Priorité », « Échéance ».
- [x] « Plus récentes » est le tri par défaut : c'est l'ordre de la story 2.
- [x] « Priorité » affiche les tâches dans l'ordre Haute, Moyenne, Basse.
- [x] « Échéance » affiche la date la plus proche en premier, les tâches en retard arrivent donc en tête.
- [x] Avec le tri « Échéance », les tâches sans date sont placées à la fin.
- [x] Deux tâches à égalité (même priorité ou même date) gardent entre elles l'ordre « Plus récentes ».
- [x] Les tâches terminées sont triées comme les autres, sans traitement à part.
- [x] Le tri ne change que l'affichage : l'ordre enregistré ne bouge pas, et revenir à « Plus récentes » redonne l'ordre de départ.
- [x] Le tri reste actif après une action : une tâche ajoutée ou modifiée se place selon le tri choisi. C'est la seule exception à la story 4, où la modification ne change pas la place de la tâche.

**10. Classer par catégorie**
En tant qu'utilisateur, je veux classer mes tâches dans une catégorie (cours, perso, projet) affichée avec sa propre couleur afin de distinguer d'un coup d'œil les différents domaines de ma vie.
- [x] Le formulaire d'ajout contient une liste déroulante « Catégorie » : Aucune, Cours, Perso, Projet.
- [x] Il n'y a pas de catégorie par défaut : « Aucune » est sélectionné au départ et la tâche est enregistrée avec `""`.
- [x] La catégorie se change aussi dans la modification de la tâche (story 4), avec la valeur actuelle déjà sélectionnée.
- [x] Chaque tâche affiche un badge de catégorie avec une couleur (Cours : bleu, Perso : violet, Projet : turquoise) **et** le mot, pour rester lisible sans distinguer les couleurs.
- [x] Les couleurs des catégories sont différentes de celles des priorités (rouge, orange, vert), pour ne pas confondre les deux badges.
- [x] Une tâche sans catégorie n'affiche aucun badge de catégorie.
- [x] Toute autre valeur que `"school"`, `"personal"`, `"project"` ou `""` est refusée à l'enregistrement.
- [x] Une tâche enregistrée avant le sprint 2, donc sans champ `category`, s'affiche quand même, sans badge de catégorie et sans planter.
- [x] Une catégorie inconnue trouvée dans `localStorage` (modifiée à la main) est remplacée par « aucune catégorie » : la tâche reste affichée, sans badge.
- [x] Le badge de catégorie a une bordure en plus de sa couleur, pour ne pas le confondre avec le badge de priorité.

**11. Rechercher une tâche** *(bonus)*
En tant qu'utilisateur, je veux rechercher une tâche par un mot-clé de son titre afin de la retrouver rapidement quand la liste est longue.
- [x] Un champ « Rechercher » est affiché au-dessus de la liste. La liste se met à jour à chaque caractère tapé, sans bouton à cliquer.
- [x] La recherche porte sur le titre uniquement, pas sur la description.
- [x] Une partie de mot suffit : « css » trouve « Réviser le CSS ».
- [x] Les majuscules et les minuscules sont ignorées.
- [x] Les accents comptent : « revision » ne trouve pas « Révision ».
- [x] Les espaces au début et à la fin du mot-clé sont ignorés. Un champ vide affiche à nouveau toutes les tâches.
- [x] Si rien ne correspond, un message l'indique : « Aucune tâche ne correspond à « xyz ». ». Si un filtre est aussi actif, c'est ce message qui est affiché, pas celui du filtre.
- [x] Un mot-clé contenant du HTML (ex. `<b>test</b>`) s'affiche tel quel dans ce message, sans être interprété.
- [x] Le compteur de la story 2 ne change pas pendant une recherche.

**Règles communes aux stories 8, 9 et 11**
- [x] Le filtre, la recherche et le tri se combinent : avec « À faire », « css » et le tri « Priorité », on voit uniquement les tâches à faire dont le titre contient « css », triées par priorité.
- [x] Le filtre, le tri et la recherche ne sont pas sauvegardés : au rechargement de la page, on repart de « Toutes », « Plus récentes » et d'un champ vide.
- [x] Après l'ajout d'une tâche, le filtre revient sur « Toutes » et la recherche est vidée, pour que la nouvelle tâche soit visible. Le tri ne change pas.
- [x] Changer de filtre, de tri ou de recherche pendant une modification enregistre d'abord la modification (comme la story 4). Si le titre est refusé, l'erreur s'affiche et le filtre, le tri ou la recherche ne change pas.

### Sprint 3 · Cybersécurité

**12. Se connecter**
En tant qu'utilisateur, je veux me connecter avec un identifiant et un mot de passe avant d'accéder à mes tâches afin qu'une autre personne utilisant le même navigateur ne les voie pas directement.
- [x] Tant que l'utilisateur n'est pas connecté, seul l'écran de connexion est visible : les tâches ne sont pas affichées.
- [x] L'écran contient un champ identifiant, un champ mot de passe dont la saisie est masquée et un bouton « Se connecter ». La touche Entrée valide comme le bouton.
- [x] Un identifiant ou un mot de passe vide est refusé avec un message d'erreur, sans tentative de connexion.
- [x] Si l'identifiant n'existe pas ou si le mot de passe est faux, le message est le même : « Identifiant ou mot de passe incorrect. », pour ne pas révéler quels comptes existent.
- [x] Après une connexion réussie, l'écran des tâches s'affiche et le champ mot de passe est vidé.
- [x] L'écran rappelle qu'il s'agit d'un compte de test : « Application de démonstration : n'utilisez pas un vrai mot de passe. ».
- [x] Le compte de test est créé au premier lancement, quand aucun compte n'est enregistré. Il n'y a pas d'écran d'inscription.
- [x] Au premier lancement, l'identifiant du compte est `test` et un écran demande de choisir son mot de passe, avec sa confirmation. Deux mots de passe différents sont refusés. Ce mot de passe passe par le contrôle de robustesse (story 13) et la jauge (story 14).
- [x] Une fois le compte créé, cet écran ne réapparaît plus : les ouvertures suivantes affichent l'écran de connexion.
- [x] Recharger la page ne déconnecte pas : la session est gardée dans `sessionStorage` jusqu'à la fermeture de l'onglet. Seul l'identifiant y est enregistré, jamais le mot de passe ni son empreinte.
- [x] Un bouton « Se déconnecter » efface la session et ramène à l'écran de connexion.
- [x] Les tâches sont communes : le modèle de données d'une tâche ne change pas.

**13. Exiger un mot de passe robuste**
En tant qu'utilisateur, je veux que mon mot de passe soit refusé s'il ne contient pas au moins 8 caractères, une majuscule, un chiffre et un caractère spécial afin d'être obligé de choisir un mot de passe robuste.
- [x] Le contrôle se fait quand le mot de passe est choisi, pas à la connexion.
- [x] Les 4 règles sont vérifiées : au moins 8 caractères, une majuscule (A à Z), un chiffre (0 à 9), un caractère spécial.
- [x] Un caractère spécial est tout ce qui n'est ni une lettre ni un chiffre : `!`, `?`, `#` ou un espace. Une lettre accentuée (`é`, `è`, `à`…) n'en est pas un.
- [x] Si une règle n'est pas respectée, le compte n'est pas créé et le message indique chaque règle manquante, par exemple « Il manque : une majuscule, un chiffre. ».
- [x] Exemples à tester : `Abcdef1!` est accepté ; `abcdef1!` (pas de majuscule), `Abcdefg!` (pas de chiffre), `Abcdefg1` et `Abcdefé1` (pas de caractère spécial) et `Abc1!` (trop court) sont refusés.

**14. Voir la jauge de robustesse**
En tant qu'utilisateur, je veux voir une jauge faible / moyen / fort se mettre à jour pendant que je tape mon mot de passe afin de savoir tout de suite s'il est assez robuste.
- [x] La jauge est affichée sous le champ où le mot de passe est choisi, pas sur l'écran de connexion.
- [x] Elle se met à jour à chaque caractère tapé ou effacé.
- [x] Le niveau dépend du nombre de règles respectées parmi les 4 de la story 13 : Faible de 0 à 2, Moyen avec 3, Fort avec 4.
- [x] Chaque niveau a une couleur (Faible : rouge, Moyen : orange, Fort : vert) **et** le mot, pour rester lisible sans distinguer les couleurs.
- [x] Quand le champ est vide, la jauge est vide et n'affiche aucun mot.
- [x] La jauge et la story 13 ne se contredisent jamais : seul le niveau Fort permet de créer le compte.

**15. Protéger le mot de passe par hachage**
En tant qu'utilisateur, je veux que mon mot de passe soit enregistré sous forme hachée et jamais en clair afin qu'il ne soit pas lisible par quelqu'un qui consulte le stockage du navigateur.
- [x] Le mot de passe est haché en SHA-256 avec `crypto.subtle.digest` avant l'enregistrement, et l'empreinte est enregistrée en texte de 64 caractères hexadécimaux.
- [x] Dans les outils de développement du navigateur, `taskflow_users` ne contient jamais le mot de passe en clair.
- [x] À la connexion, le mot de passe saisi est haché, puis l'empreinte est comparée à celle enregistrée.
- [x] Le mot de passe n'apparaît nulle part ailleurs : ni dans la console, ni dans le code, ni dans l'état gardé par `app.js`.
- [x] Si `crypto.subtle` n'est pas disponible dans le navigateur, le compte n'est pas créé et un message l'indique. Le mot de passe n'est jamais enregistré en clair à la place.
- [ ] Vérifier le hachage en ouvrant `src/index.html` par double-clic, et sur le site GitHub Pages, dans les navigateurs utilisés pour la démonstration.

**16. Bloquer après 3 échecs** *(bonus)*
En tant qu'utilisateur, je veux que la connexion soit bloquée après 3 mots de passe incorrects afin d'empêcher quelqu'un d'essayer des mots de passe au hasard.
- [ ] Le compteur d'échecs est propre à chaque compte, et les échecs sont comptés de suite : une connexion réussie le remet à 0.
- [ ] Un champ vide ne compte pas comme un échec. Un identifiant inconnu non plus, puisqu'il n'y a pas de compte à bloquer.
- [ ] Au 3e échec, le compte est bloqué et un message s'affiche : « Compte bloqué. Réessayez dans 20 secondes. ».
- [ ] Le blocage dure 20 secondes, puis se lève tout seul et le compteur repart de 0.
- [ ] Pendant le blocage, la connexion est refusée même avec le bon mot de passe.
- [ ] Le blocage continue après un rechargement de la page, car l'heure de fin est enregistrée.

**Modèle utilisateur**

Un tableau enregistré sous la clé `taskflow_users` :

```json
[
  { "username": "test", "passwordHash": "64 caractères hexadécimaux", "failedAttempts": 0, "lockedUntil": 0 }
]
```

- `lockedUntil` : heure de fin du blocage en millisecondes (comme `Date.now()`), `0` si le compte n'est pas bloqué.

**Limites de sécurité d'une connexion côté client**

Ces limites sont connues et ne se corrigent pas sans serveur :
- La connexion ne protège que l'affichage : avec les outils de développement, n'importe qui peut lire ou modifier `localStorage`, y compris les tâches, qui ne sont pas chiffrées, et se déclarer connecté en écrivant dans `sessionStorage`.
- Le blocage se contourne en vidant les données du site ou en remettant le compteur à 0.
- SHA-256 est un hachage rapide et il n'y a pas de sel : deux mots de passe identiques donnent la même empreinte, et les mots de passe faibles se retrouvent facilement. Un vrai site utiliserait un algorithme lent et salé, côté serveur.
- Un mot de passe oublié ne peut pas être récupéré, puisque seule l'empreinte est enregistrée. Il faut vider les données du site, ce qui efface aussi les tâches.
- Pour toutes ces raisons, l'application n'accepte que des comptes de test fictifs : jamais de vrai mot de passe ni de données personnelles réelles.

