/*
 * storage.js — objet Stockage
 * Lecture / écriture JSON dans localStorage (clés taskflow_tasks, taskflow_users).
 * Renvoie une valeur par défaut si la donnée est absente ou corrompue (try/catch).
 * Dépend de : rien.
 * Seul fichier qui accède à localStorage. Pas de règle métier ici.
 */
const Stockage = {
  // Clés préfixées par "taskflow_" : le localStorage est partagé par tous
  // les sites de m-programmation.github.io (voir PROMPTS.md, prompt 8).
  CLE_TACHES: "taskflow_tasks",

  // Lit une valeur JSON. Renvoie valeurParDefaut si la clé n'existe pas,
  // si le JSON est abîmé, ou si le navigateur bloque localStorage.
  lire: function (cle, valeurParDefaut) {
    try {
      const texte = localStorage.getItem(cle);
      if (texte === null) {
        return valeurParDefaut; // rien d'enregistré pour l'instant
      }
      return JSON.parse(texte);
    } catch {
      // Erreur volontairement ignorée : données illisibles ou stockage bloqué.
      // On repart de la valeur par défaut pour que l'application ne plante pas (story 7).
      return valeurParDefaut;
    }
  },

  // Écrit une valeur en JSON. Renvoie true si tout s'est bien passé, false sinon
  // (par exemple si le stockage du navigateur est plein).
  ecrire: function (cle, valeur) {
    try {
      localStorage.setItem(cle, JSON.stringify(valeur));
      return true;
    } catch {
      // Erreur transformée en résultat : c'est l'appelant qui décide quoi faire de false.
      return false;
    }
  },

  // Renvoie le tableau des tâches enregistrées, ou [] s'il n'y en a pas
  // ou si ce qui est enregistré n'est pas un tableau.
  chargerTaches: function () {
    const taches = Stockage.lire(Stockage.CLE_TACHES, []);
    if (!Array.isArray(taches)) {
      return [];
    }
    return taches;
  },

  // Réécrit le tableau entier des tâches.
  sauverTaches: function (taches) {
    return Stockage.ecrire(Stockage.CLE_TACHES, taches);
  },
};
