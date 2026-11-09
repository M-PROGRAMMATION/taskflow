/*
 * app.js — point d'entrée
 * Garde l'état (tâches, filtre, tri, recherche, utilisateur connecté),
 * branche les événements et enchaîne : modifier l'état → sauvegarder → réafficher.
 * Dépend de : Utils, Stockage, Auth, Taches, Interface.
 * Ne construit pas de HTML et ne contient pas de règle métier.
 */

// Tout le code est dans une fonction appelée tout de suite (IIFE) :
// ses variables restent locales, app.js n'ajoute aucune variable globale.
(function () {
  "use strict";

  // État de l'application : la seule source de vérité.
  const etat = {
    taches: [],
    idEnModification: null, // id de la tâche en cours de modification, ou null (story 4)
    filtre: "all", // "all", "todo" ou "done" (story 8), non sauvegardé
    tri: "recent", // "recent", "priority" ou "dueDate" (story 9), non sauvegardé
  };

  // Indique quel message afficher quand la liste à l'écran est vide :
  //   "aucune" s'il n'existe aucune tâche (story 2),
  //   "todo" ou "done" si c'est le filtre qui ne donne rien (story 8),
  //   "" si la liste n'est pas vide.
  function casListeVide(tachesVisibles) {
    if (etat.taches.length === 0) {
      return "aucune";
    }
    if (tachesVisibles.length > 0) {
      return "";
    }
    return etat.filtre;
  }

  // Réaffiche tout l'écran à partir de l'état.
  function rafraichir() {
    // État de l'échéance de chaque tâche, rangé par id, pour les badges de la story 3
    const aujourdhui = Utils.dateDuJour();
    const echeances = {};
    etat.taches.forEach(function (tache) {
      echeances[tache.id] = Taches.etatEcheance(tache, aujourdhui);
    });

    // Seules les tâches du filtre choisi sont affichées, dans l'ordre du tri choisi.
    // etat.taches ne change pas : filtre et tri renvoient de nouvelles listes.
    const tachesFiltrees = Taches.filtrerParStatut(etat.taches, etat.filtre);
    const tachesVisibles = Taches.trier(tachesFiltrees, etat.tri);

    Interface.afficherTaches(tachesVisibles, echeances, etat.idEnModification);
    Interface.afficherMessageVide(casListeVide(tachesVisibles));
    Interface.afficherFiltre(etat.filtre);
    Interface.afficherTri(etat.tri);
    // Le compteur compte toujours toutes les tâches à faire, quel que soit le filtre
    Interface.afficherCompteur(Taches.compterAFaire(etat.taches));
  }

  // Remplace la liste des tâches, la sauvegarde tout de suite (story 7), puis réaffiche.
  // Toutes les actions passent par ici : état → sauvegarde → affichage.
  // La ligne en modification est refermée : avant d'arriver ici, elle a déjà
  // été enregistrée (enregistrerModificationEnCours) ou annulée.
  function mettreAJour(nouvellesTaches) {
    etat.taches = nouvellesTaches;
    etat.idEnModification = null;
    Stockage.sauverTaches(etat.taches);
    rafraichir();
  }

  // Si une tâche est en cours de modification, on l'enregistre avant de faire
  // une autre action (cocher, supprimer, ajouter, modifier une autre tâche).
  // Renvoie true si on peut continuer, false si le titre saisi est refusé :
  // dans ce cas l'erreur s'affiche et l'autre action n'est pas faite.
  function enregistrerModificationEnCours() {
    if (etat.idEnModification === null) {
      return true; // rien en cours de modification
    }
    const donnees = Interface.lireFormulaireModification();
    const resultat = Taches.valider(donnees);
    if (!resultat.valide) {
      Interface.afficherErreurModification(resultat.message);
      return false;
    }
    mettreAJour(Taches.modifier(etat.taches, etat.idEnModification, donnees));
    return true;
  }

  // ---------- Actions ----------

  // Story 1 : ajout d'une tâche depuis le formulaire.
  function ajouterTache(donnees) {
    if (!enregistrerModificationEnCours()) {
      return;
    }
    const resultat = Taches.valider(donnees);
    if (!resultat.valide) {
      Interface.afficherErreurAjout(resultat.message);
      return; // aucune tâche n'est créée
    }
    // Retour sur « Toutes » pour que la nouvelle tâche soit visible
    etat.filtre = "all";
    mettreAJour(Taches.creer(etat.taches, donnees));
    Interface.viderFormulaireAjout();
  }

  // Clics dans la liste : action vaut la valeur data-action de l'élément cliqué.
  // Renvoie false si l'action est refusée (Interface annule alors le clic,
  // pour que la case ne se coche pas toute seule à l'écran).
  function traiterActionListe(action, id) {
    if (action === "annuler") {
      annulerModification(); // « Annuler » ne doit surtout pas enregistrer
      return true;
    }
    if (!enregistrerModificationEnCours()) {
      return false;
    }
    if (action === "terminer") {
      // Story 5 : cocher ou décocher la case
      mettreAJour(Taches.basculerStatut(etat.taches, id));
      Interface.remettreFocus(id, "terminer");
    } else if (action === "supprimer") {
      // Story 6 : corbeille, avec confirmation qui rappelle le titre
      const tache = Taches.trouver(etat.taches, id);
      if (tache !== undefined && Interface.confirmerSuppression(tache.title)) {
        mettreAJour(Taches.supprimer(etat.taches, id));
      }
    } else if (action === "modifier") {
      commencerModification(id);
    }
    return true;
  }

  // Story 4 : la ligne devient un formulaire. Une seule à la fois :
  // la tâche précédente a déjà été enregistrée par traiterActionListe.
  function commencerModification(id) {
    etat.idEnModification = id;
    rafraichir();
    Interface.focaliserModification();
  }

  // Bouton « Annuler » ou touche Échap : on referme sans rien changer.
  function annulerModification() {
    const id = etat.idEnModification;
    etat.idEnModification = null;
    rafraichir();
    Interface.remettreFocus(id, "modifier");
  }

  // Bouton « Enregistrer » ou touche Entrée : mêmes règles que l'ajout.
  function enregistrerModification() {
    const id = etat.idEnModification;
    if (enregistrerModificationEnCours()) {
      Interface.remettreFocus(id, "modifier");
    }
  }

  // Story 8 : clic sur un bouton de filtre. Ne change que l'affichage, rien n'est sauvegardé.
  // Comme les autres actions, une modification en cours est d'abord enregistrée.
  function changerFiltre(filtre) {
    if (!enregistrerModificationEnCours()) {
      return;
    }
    etat.filtre = filtre;
    rafraichir();
  }

  // Story 9 : choix dans la liste « Trier par ». Ne change que l'affichage.
  // Si la modification en cours est refusée, la liste reprend le tri d'avant.
  function changerTri(tri) {
    if (!enregistrerModificationEnCours()) {
      Interface.afficherTri(etat.tri);
      return;
    }
    etat.tri = tri;
    rafraichir();
  }

  // ---------- Démarrage ----------

  function demarrer() {
    // On recharge les tâches enregistrées (story 7)
    etat.taches = Taches.nettoyerListe(Stockage.chargerTaches());

    // On branche les événements
    Interface.surAjout(ajouterTache);
    Interface.surActionListe(traiterActionListe);
    Interface.surModification(enregistrerModification, annulerModification);
    Interface.surFiltre(changerFiltre);
    Interface.surTri(changerTri);

    rafraichir();
  }

  demarrer();
})();
