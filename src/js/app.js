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
  };

  // Réaffiche tout l'écran à partir de l'état.
  function rafraichir() {
    // État de l'échéance de chaque tâche, rangé par id, pour les badges de la story 3
    const aujourdhui = Utils.dateDuJour();
    const echeances = {};
    etat.taches.forEach(function (tache) {
      echeances[tache.id] = Taches.etatEcheance(tache, aujourdhui);
    });

    Interface.afficherTaches(etat.taches, echeances);
    Interface.afficherCompteur(Taches.compterAFaire(etat.taches));
  }

  // Remplace la liste des tâches, la sauvegarde tout de suite (story 7), puis réaffiche.
  // Toutes les actions passent par ici : état → sauvegarde → affichage.
  function mettreAJour(nouvellesTaches) {
    etat.taches = nouvellesTaches;
    Stockage.sauverTaches(etat.taches);
    rafraichir();
  }

  // ---------- Actions ----------

  // Story 1 : ajout d'une tâche depuis le formulaire.
  function ajouterTache(donnees) {
    const resultat = Taches.valider(donnees);
    if (!resultat.valide) {
      Interface.afficherErreurAjout(resultat.message);
      return; // aucune tâche n'est créée
    }
    mettreAJour(Taches.creer(etat.taches, donnees));
    Interface.viderFormulaireAjout();
  }

  // Clics dans la liste : action vaut la valeur data-action de l'élément cliqué.
  function traiterActionListe(action, id) {
    if (action === "terminer") {
      // Story 5 : cocher ou décocher la case
      mettreAJour(Taches.basculerStatut(etat.taches, id));
      Interface.remettreFocus(id, "terminer");
    }
  }

  // ---------- Démarrage ----------

  function demarrer() {
    // On recharge les tâches enregistrées (story 7)
    etat.taches = Taches.nettoyerListe(Stockage.chargerTaches());

    // On branche les événements
    Interface.surAjout(ajouterTache);
    Interface.surActionListe(traiterActionListe);

    rafraichir();
  }

  demarrer();
})();
