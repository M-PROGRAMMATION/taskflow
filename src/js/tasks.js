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
  CATEGORIES: ["school", "personal", "project"], // ou "" si aucune (story 10)
  TITRE_MAX: 100,

  // Vérifie les données d'un formulaire (ajout ou modification).
  // donnees : { title, description, priority, dueDate, category }, telles que saisies.
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
    // Catégorie facultative : "" ou une des valeurs autorisées (story 10)
    if (donnees.category !== "" && !Taches.CATEGORIES.includes(donnees.category)) {
      return { valide: false, message: "La catégorie choisie n'existe pas." };
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
      category: donnees.category,
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
        // Tâche d'avant le sprint 2 (sans category) ou catégorie inconnue : aucune catégorie
        category: Taches.CATEGORIES.includes(tache.category) ? tache.category : "",
      };
    });
  },

  // Modifie le titre, la description, la priorité, l'échéance et la catégorie
  // d'une tâche (stories 4 et 10). L'id, le statut et la place dans la liste ne changent pas.
  // À appeler seulement si Taches.valider(donnees) a renvoyé valide: true.
  modifier: function (liste, id, donnees) {
    return liste.map(function (tache) {
      if (tache.id !== id) {
        return tache;
      }
      const copie = { ...tache };
      copie.title = Utils.nettoyerTexte(donnees.title);
      copie.description = Utils.nettoyerTexte(donnees.description);
      copie.priority = donnees.priority;
      copie.dueDate = Utils.nettoyerTexte(donnees.dueDate);
      copie.category = donnees.category;
      return copie;
    });
  },

  // Passe une tâche de "todo" à "done", ou de "done" à "todo" (story 5).
  // Renvoie une nouvelle liste : map crée un nouveau tableau, et la tâche
  // changée est une copie ({ ...tache }), l'originale n'est pas modifiée.
  basculerStatut: function (liste, id) {
    return liste.map(function (tache) {
      if (tache.id !== id) {
        return tache;
      }
      const copie = { ...tache };
      copie.status = tache.status === "done" ? "todo" : "done";
      return copie;
    });
  },

  // Retire une tâche (story 6). filter renvoie une nouvelle liste
  // qui garde toutes les tâches sauf celle qui a cet id.
  supprimer: function (liste, id) {
    return liste.filter(function (tache) {
      return tache.id !== id;
    });
  },

  // Retrouve une tâche par son id. Renvoie undefined si elle n'existe pas.
  trouver: function (liste, id) {
    return liste.find(function (tache) {
      return tache.id === id;
    });
  },

  // Garde les tâches qui correspondent au filtre de statut (story 8) :
  //   "all" → toutes, "todo" → à faire, "done" → terminées.
  // filter renvoie une nouvelle liste : rien n'est supprimé de la liste d'origine.
  filtrerParStatut: function (liste, filtre) {
    if (filtre === "all") {
      return liste.slice(); // copie de la liste entière
    }
    return liste.filter(function (tache) {
      return tache.status === filtre;
    });
  },

  // Trie les tâches (story 9) et renvoie une NOUVELLE liste :
  //   "recent"   → ordre enregistré (les plus récentes en haut, story 2),
  //   "priority" → Haute, Moyenne, Basse,
  //   "dueDate"  → date la plus proche en premier, tâches sans date à la fin.
  // On trie une copie (slice) : sort modifie le tableau sur lequel il est appelé.
  // sort est stable : deux tâches à égalité gardent leur ordre « plus récentes ».
  trier: function (liste, tri) {
    const copie = liste.slice();
    if (tri === "priority") {
      // indexOf donne 0 pour "high", 1 pour "medium", 2 pour "low"
      copie.sort(function (a, b) {
        return Taches.PRIORITES.indexOf(a.priority) - Taches.PRIORITES.indexOf(b.priority);
      });
    } else if (tri === "dueDate") {
      copie.sort(function (a, b) {
        if (a.dueDate === b.dueDate) {
          return 0; // même date, ou toutes les deux sans date
        }
        if (a.dueDate === "") {
          return 1; // a n'a pas de date : elle va après b
        }
        if (b.dueDate === "") {
          return -1; // b n'a pas de date : a passe devant
        }
        // Deux dates ISO se comparent comme du texte
        return a.dueDate < b.dueDate ? -1 : 1;
      });
    }
    return copie; // "recent" : l'ordre enregistré ne change pas
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
