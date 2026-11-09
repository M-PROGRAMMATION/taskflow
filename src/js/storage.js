/*
 * storage.js — objet Stockage
 * Lecture / écriture JSON dans localStorage (clés taskflow_tasks, taskflow_users),
 * et session de connexion dans sessionStorage (clé taskflow_session).
 * Renvoie une valeur par défaut si la donnée est absente ou corrompue (try/catch).
 * Dépend de : rien.
 * Seul fichier qui accède à localStorage et sessionStorage. Pas de règle métier ici.
 */
const Stockage = {
  // Clés préfixées par "taskflow_" : le localStorage est partagé par tous
  // les sites de m-programmation.github.io (voir PROMPTS.md, prompt 8).
  CLE_TACHES: "taskflow_tasks",
  CLE_UTILISATEURS: "taskflow_users", // comptes (sprint 3)
  CLE_SESSION: "taskflow_session", // utilisateur connecté, dans sessionStorage (sprint 3)

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

  // ---------- Comptes (sprint 3) ----------

  // Renvoie le tableau des comptes enregistrés, ou [] s'il n'y en a pas
  // ou si ce qui est enregistré n'est pas un tableau.
  chargerUtilisateurs: function () {
    const utilisateurs = Stockage.lire(Stockage.CLE_UTILISATEURS, []);
    if (!Array.isArray(utilisateurs)) {
      return [];
    }
    return utilisateurs;
  },

  // Réécrit le tableau entier des comptes (empreintes seulement, jamais de mot de passe en clair).
  sauverUtilisateurs: function (utilisateurs) {
    return Stockage.ecrire(Stockage.CLE_UTILISATEURS, utilisateurs);
  },

  // ---------- Session (story 12) ----------
  // sessionStorage ressemble à localStorage, mais il est effacé quand on ferme l'onglet.
  // Recharger la page (F5) ne l'efface pas : on reste connecté.
  // Seul l'identifiant y est enregistré, jamais le mot de passe ni son empreinte.

  // Renvoie l'identifiant de l'utilisateur connecté, ou "" si personne ne l'est.
  lireSession: function () {
    try {
      const identifiant = sessionStorage.getItem(Stockage.CLE_SESSION);
      return identifiant === null ? "" : identifiant;
    } catch {
      // Stockage bloqué par le navigateur : on considère que personne n'est connecté.
      return "";
    }
  },

  // Enregistre l'identifiant de l'utilisateur qui vient de se connecter.
  ecrireSession: function (identifiant) {
    try {
      sessionStorage.setItem(Stockage.CLE_SESSION, identifiant);
      return true;
    } catch {
      return false;
    }
  },

  // Efface la session (bouton « Se déconnecter »).
  effacerSession: function () {
    try {
      sessionStorage.removeItem(Stockage.CLE_SESSION);
    } catch {
      // Rien à faire : si le stockage est bloqué, aucune session n'a pu être enregistrée.
    }
  },
};
