/*
 * tasks.js — objet Taches
 * Règles métier des tâches : validation, création, modification, changement de statut,
 * suppression, filtre, tri, recherche.
 * Fonctions pures : reçoivent une liste et renvoient une nouvelle liste.
 * Dépend de : Utils.
 * Pas d'accès au DOM ni à localStorage.
 */
const Taches = {
  // Valeurs autorisées (voir le modèle de données dans le README)
  PRIORITES: ["high", "medium", "low"],
  STATUTS: ["todo", "done"],

  // Garde seulement les tâches lisibles d'une liste venue du stockage
  // (story 7 : des données modifiées à la main ne doivent pas faire planter l'application).
  // Renvoie une nouvelle liste ; les champs facultatifs absents valent "".
  nettoyerListe: function (liste) {
    const valides = liste.filter(function (tache) {
      return (
        tache !== null &&
        typeof tache === "object" &&
        typeof tache.id === "number" &&
        typeof tache.title === "string" &&
        Taches.PRIORITES.includes(tache.priority) &&
        Taches.STATUTS.includes(tache.status)
      );
    });
    return valides.map(function (tache) {
      return {
        id: tache.id,
        title: tache.title,
        description: typeof tache.description === "string" ? tache.description : "",
        priority: tache.priority,
        dueDate: typeof tache.dueDate === "string" ? tache.dueDate : "",
        status: tache.status,
        category: typeof tache.category === "string" ? tache.category : "",
      };
    });
  },

  // Nombre de tâches encore à faire (pour le compteur de la story 2).
  compterAFaire: function (liste) {
    return liste.filter(function (tache) {
      return tache.status === "todo";
    }).length;
  },

  // État de l'échéance d'une tâche (story 3) :
  //   "late"  si elle est à faire et que la date est dépassée,
  //   "today" si elle est à faire et que la date est aujourd'hui,
  //   ""      sinon (terminée, sans date, ou date à venir).
  // aujourdhui est la date du jour au format "YYYY-MM-DD" : on compare des jours, pas des heures.
  // Deux dates ISO se comparent comme du texte : "2026-11-08" < "2026-11-09".
  etatEcheance: function (tache, aujourdhui) {
    if (tache.status === "done" || tache.dueDate === "") {
      return "";
    }
    if (tache.dueDate < aujourdhui) {
      return "late";
    }
    if (tache.dueDate === aujourdhui) {
      return "today";
    }
    return "";
  },
};
