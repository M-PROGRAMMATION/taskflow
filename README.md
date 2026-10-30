# TaskFlow

Application web de gestion de tâches en HTML, CSS et JavaScript natif, sans framework ni bibliothèque externe. Les données sont sauvegardées dans le navigateur avec `localStorage`.

Filières du binôme : Informatique et Cybersécurité.

## User Stories

### Sprint 1 · La base

1. En tant qu'utilisateur, je veux ajouter une tâche en renseignant son titre, sa priorité et sa date d'échéance afin de noter ce que j'ai à faire. Une tâche sans titre est refusée.
2. En tant qu'utilisateur, je veux voir la liste de toutes mes tâches avec leur titre, leur priorité (en couleur) et leur échéance afin d'avoir une vue d'ensemble de mon travail.
3. En tant qu'utilisateur, je veux modifier le titre, la priorité ou l'échéance d'une tâche existante afin de corriger une erreur ou de tenir compte d'un changement.
4. En tant qu'utilisateur, je veux cocher une tâche pour la marquer comme terminée afin de voir clairement ce que j'ai déjà accompli. Une tâche terminée apparaît barrée.
5. En tant qu'utilisateur, je veux supprimer une tâche avec l'icône corbeille afin de retirer de ma liste celles qui ne sont plus utiles.
6. En tant qu'utilisateur, je veux retrouver mes tâches après avoir fermé puis rouvert mon navigateur afin de ne pas perdre mon travail.

### Sprint 2 · Informatique

7. En tant qu'utilisateur, je veux filtrer mes tâches par statut (toutes, à faire, terminées) afin de me concentrer sur ce qui reste à faire.
8. En tant qu'utilisateur, je veux trier mes tâches par priorité ou par date d'échéance afin de savoir quoi faire en premier.
9. En tant qu'utilisateur, je veux classer chaque tâche dans une catégorie (cours, perso, projet) affichée avec sa propre couleur afin de distinguer d'un coup d'œil les différents domaines de ma vie.
10. *(Bonus)* En tant qu'utilisateur, je veux rechercher une tâche par un mot-clé de son titre afin de la retrouver rapidement quand la liste est longue.

### Sprint 3 · Cybersécurité

11. En tant qu'utilisateur, je veux me connecter avec un identifiant et un mot de passe avant d'accéder à mes tâches afin qu'une autre personne utilisant le même navigateur ne les voie pas directement.
12. En tant qu'utilisateur, je veux que mon mot de passe soit refusé s'il ne contient pas au moins 8 caractères, une majuscule, un chiffre et un caractère spécial afin d'être obligé de choisir un mot de passe robuste.
13. En tant qu'utilisateur, je veux voir une jauge faible / moyen / fort se mettre à jour pendant que je tape mon mot de passe afin de savoir tout de suite s'il est assez robuste.
14. En tant qu'utilisateur, je veux que mon mot de passe soit enregistré sous forme hachée et jamais en clair afin qu'il ne soit pas lisible par quelqu'un qui consulte le stockage du navigateur.
15. *(Bonus)* En tant qu'utilisateur, je veux que la connexion soit bloquée après 3 mots de passe incorrects afin d'empêcher quelqu'un d'essayer des mots de passe au hasard.

> À trancher avant le sprint 3 : où le mot de passe est-il choisi (écran d'inscription ou compte de test créé au premier lancement) ? Combien de temps dure le blocage, et comment le lever ?
