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
  TITRE_MAX: 100,

  // Vérifie les données d'un formulaire (ajout ou modification).
  // donnees : { title, description, priority, dueDate }, telles que saisies.
  // Renvoie { valide: true } ou { valide: false, message: "..." }.
  // C'est Interface qui affichera le message : ici on ne touche pas à l'écran.
  valider: function (donnees) {
    const titre = Utils.nettoyerTexte(donnees.title);
    if (titre === "") {
      return { valide: false, message: "Le titre est obligatoire." };
    }
    if (titre.length > Taches.TITRE_MAX) {
      return {
        valide: false,
        message: "Le titre doit faire au maximum " + Taches.TITRE_MAX + " caractères.",
      };
    }
    if (!Taches.PRIORITES.includes(donnees.priority)) {
      return { valide: false, message: "La priorité choisie n'existe pas." };
    }
    // Échéance facultative : "" ou une date "YYYY-MM-DD".
    // Une date passée est acceptée (story 3 : le badge « En retard » sert d'avertissement).
    const echeance = Utils.nettoyerTexte(donnees.dueDate);
    if (echeance !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(echeance)) {
      return { valide: false, message: "La date d'échéance n'est pas valide." };
    }
    return { valide: true };
  },

  // Crée une tâche et renvoie une NOUVELLE liste, avec la tâche en premier
  // (les plus récentes en haut, story 2). La liste reçue n'est pas modifiée.
  // À appeler seulement si Taches.valider(donnees) a renvoyé valide: true.
  creer: function (liste, donnees) {
    const nouvelleTache = {
      id: Utils.genererId(),
      title: Utils.nettoyerTexte(donnees.title),
      description: Utils.nettoyerTexte(donnees.description),
      priority: donnees.priority,
      dueDate: Utils.nettoyerTexte(donnees.dueDate),
      status: "todo",
      category: "", // les catégories arrivent au sprint 2
    };
    return [nouvelleTache].concat(liste);
  },

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
