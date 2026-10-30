# TaskFlow

Application web de gestion de tâches en HTML, CSS et JavaScript natif, sans framework ni bibliothèque externe. Les données sont sauvegardées dans le navigateur avec `localStorage`.

Filières du binôme : Informatique et Cybersécurité.

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
| `category` | texte | `"school"`, `"personal"`, `"project"` | Cours, Perso, Projet | Ajouté au sprint 2. Valeur par défaut. | Proposé (filière Informatique) |

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
- Le modèle utilisateur (identifiant, mot de passe haché, compteur d'échecs) sera défini avant le sprint 3, sous la clé `taskflow_users`, avec des clés en anglais lui aussi.

## User Stories

Chaque story a des **critères d'acceptation** : la liste des vérifications à faire pour dire que la story est terminée. Une mention signale une proposition qui n'est pas encore décidée par le binôme.

### Sprint 1 · La base

**1. Ajouter une tâche**
En tant qu'utilisateur, je veux ajouter une tâche en renseignant son titre, sa priorité et sa date d'échéance afin de noter ce que j'ai à faire.
- [ ] Le formulaire contient un champ titre, une liste déroulante priorité (Haute, Moyenne, Basse), un sélecteur de date pour l'échéance et un bouton « Ajouter ».
- [ ] Un titre vide ou composé uniquement d'espaces est refusé : un message d'erreur s'affiche sous le champ et aucune tâche n'est créée.
- [ ] Les espaces au début et à la fin du titre sont retirés avant l'enregistrement.
- [ ] Le titre fait au maximum 100 caractères.
- [ ] La priorité est « Moyenne » par défaut.
- [ ] La touche Entrée valide le formulaire, comme le bouton « Ajouter ».
- [ ] Après l'ajout, la tâche apparaît dans la liste avec le statut « à faire », le formulaire est vidé et le curseur revient dans le champ titre.
- [ ] Un titre contenant du HTML (ex. `<b>test</b>`) s'affiche tel quel, en texte, sans être interprété.

**2. Voir toutes ses tâches**
En tant qu'utilisateur, je veux voir la liste de toutes mes tâches avec leur titre, leur priorité et leur échéance afin d'avoir une vue d'ensemble de mon travail.
- [ ] Chaque tâche affiche : une case à cocher, son titre, un badge de priorité, son échéance au format jj/mm/aaaa, un bouton modifier et un bouton corbeille.
- [ ] Le badge de priorité a une couleur (Haute : rouge, Moyenne : orange, Basse : vert) **et** contient le mot, pour rester lisible sans distinguer les couleurs.
- [ ] Une tâche sans échéance affiche « Sans date ».
- [ ] Les tâches les plus récentes apparaissent en haut de la liste.
- [ ] Quand la liste est vide, un message l'indique : « Aucune tâche pour le moment. Ajoutez-en une avec le formulaire. »
- [ ] Un compteur indique le nombre de tâches restantes, par exemple « 3 tâches à faire » (« 1 tâche à faire » au singulier).

**3. Repérer les échéances proches**
En tant qu'utilisateur, je veux voir au premier coup d'œil les tâches en retard ou à faire aujourd'hui afin de ne pas rater une échéance.
- [ ] Une tâche à faire dont l'échéance est dépassée affiche un badge rouge « En retard ».
- [ ] Une tâche à faire dont l'échéance est aujourd'hui affiche un badge orange « Aujourd'hui ».
- [ ] Une tâche terminée n'affiche jamais de badge de retard.
- [ ] La comparaison se fait sur la date du jour, sans tenir compte de l'heure.

**4. Modifier une tâche**
En tant qu'utilisateur, je veux modifier le titre, la priorité ou l'échéance d'une tâche existante afin de corriger une erreur ou de tenir compte d'un changement.
- [ ] Le bouton modifier (crayon) ouvre la modification de la tâche, avec les valeurs actuelles déjà remplies. Où se fait la modification (dans la liste ou dans le formulaire d'ajout).
- [ ] Les règles de l'ajout s'appliquent aussi : un titre vide est refusé avec un message d'erreur.
- [ ] Un bouton « Enregistrer » valide les changements ; un bouton « Annuler » (ou la touche Échap) referme sans rien changer.
- [ ] Une seule tâche peut être en cours de modification à la fois.
- [ ] La modification ne change ni l'identifiant, ni le statut, ni la place de la tâche dans la liste.

**5. Terminer une tâche**
En tant qu'utilisateur, je veux cocher une tâche pour la marquer comme terminée afin de voir clairement ce que j'ai déjà accompli.
- [ ] Cocher la case passe la tâche au statut « terminée » : son titre apparaît barré et grisé.
- [ ] Décocher la case la remet « à faire », pour corriger un clic par erreur.
- [ ] Le compteur de tâches restantes se met à jour tout de suite.

**6. Supprimer une tâche**
En tant qu'utilisateur, je veux supprimer une tâche avec l'icône corbeille afin de retirer de ma liste celles qui ne sont plus utiles.
- [ ] Un clic sur la corbeille demande une confirmation qui rappelle le titre : « Supprimer la tâche « Réviser le CSS » ? ».
- [ ] Si l'utilisateur annule, rien ne change.
- [ ] Si l'utilisateur confirme, la tâche disparaît de la liste et le compteur se met à jour.
- [ ] La suppression est définitive : il n'y a pas de corbeille pour récupérer une tâche.

**7. Retrouver ses tâches**
En tant qu'utilisateur, je veux retrouver mes tâches après avoir fermé puis rouvert mon navigateur afin de ne pas perdre mon travail.
- [ ] Chaque action (ajout, modification, case cochée, suppression) est sauvegardée immédiatement, sans bouton « Enregistrer » global.
- [ ] Après fermeture et réouverture du navigateur, on retrouve les mêmes tâches, avec le même statut et dans le même ordre.
- [ ] Si les données sauvegardées sont illisibles (abîmées ou modifiées à la main), l'application démarre quand même, avec une liste vide, sans planter.
- [ ] Limite connue : les tâches sont liées à ce navigateur sur cet appareil. Elles ne sont pas visibles depuis un autre ordinateur, et vider les données du site les efface.

### Sprint 2 · Informatique

8. En tant qu'utilisateur, je veux filtrer mes tâches par statut (toutes, à faire, terminées) afin de me concentrer sur ce qui reste à faire.
9. En tant qu'utilisateur, je veux trier mes tâches par priorité ou par date d'échéance afin de savoir quoi faire en premier.
10. En tant qu'utilisateur, je veux classer chaque tâche dans une catégorie (cours, perso, projet) affichée avec sa propre couleur afin de distinguer d'un coup d'œil les différents domaines de ma vie.
11. *(Bonus)* En tant qu'utilisateur, je veux rechercher une tâche par un mot-clé de son titre afin de la retrouver rapidement quand la liste est longue.

### Sprint 3 · Cybersécurité

12. En tant qu'utilisateur, je veux me connecter avec un identifiant et un mot de passe avant d'accéder à mes tâches afin qu'une autre personne utilisant le même navigateur ne les voie pas directement.
13. En tant qu'utilisateur, je veux que mon mot de passe soit refusé s'il ne contient pas au moins 8 caractères, une majuscule, un chiffre et un caractère spécial afin d'être obligé de choisir un mot de passe robuste.
14. En tant qu'utilisateur, je veux voir une jauge faible / moyen / fort se mettre à jour pendant que je tape mon mot de passe afin de savoir tout de suite s'il est assez robuste.
15. En tant qu'utilisateur, je veux que mon mot de passe soit enregistré sous forme hachée et jamais en clair afin qu'il ne soit pas lisible par quelqu'un qui consulte le stockage du navigateur.
16. *(Bonus)* En tant qu'utilisateur, je veux que la connexion soit bloquée après 3 mots de passe incorrects afin d'empêcher quelqu'un d'essayer des mots de passe au hasard.

> À trancher avant le sprint 3 : où le mot de passe est-il choisi (écran d'inscription ou compte de test créé au premier lancement) ? Combien de temps dure le blocage, et comment le lever ?
