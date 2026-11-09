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
    recherche: "", // texte tapé dans le champ « Rechercher » (story 11), non sauvegardé
    utilisateur: "", // identifiant de l'utilisateur connecté, "" si personne (story 12)
    // Jamais de mot de passe ni d'empreinte dans l'état (story 15)
  };

  // Indique quel message afficher quand la liste à l'écran est vide :
  //   "aucune" s'il n'existe aucune tâche (story 2),
  //   "recherche" si une recherche est en cours et ne trouve rien (story 11),
  //   "todo" ou "done" si c'est le filtre qui ne donne rien (story 8),
  //   "" si la liste n'est pas vide.
  function casListeVide(tachesVisibles) {
    if (etat.taches.length === 0) {
      return "aucune";
    }
    if (tachesVisibles.length > 0) {
      return "";
    }
    if (Utils.nettoyerTexte(etat.recherche) !== "") {
      return "recherche";
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

    // Seules les tâches du filtre et de la recherche sont affichées, dans l'ordre du tri.
    // etat.taches ne change pas : filtre, recherche et tri renvoient de nouvelles listes.
    const tachesFiltrees = Taches.filtrerParStatut(etat.taches, etat.filtre);
    const tachesTrouvees = Taches.rechercher(tachesFiltrees, etat.recherche);
    const tachesVisibles = Taches.trier(tachesTrouvees, etat.tri);

    Interface.afficherTaches(tachesVisibles, echeances, etat.idEnModification);
    Interface.afficherMessageVide(casListeVide(tachesVisibles), Utils.nettoyerTexte(etat.recherche));
    Interface.afficherFiltre(etat.filtre);
    Interface.afficherTri(etat.tri);
    Interface.afficherRecherche(etat.recherche);
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
    // Retour sur « Toutes » et recherche vidée, pour que la nouvelle tâche soit visible.
    // Le tri, lui, ne change pas.
    etat.filtre = "all";
    etat.recherche = "";
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

  // Story 11 : la liste se met à jour à chaque caractère tapé dans « Rechercher ».
  // Si la modification en cours est refusée, le champ reprend le texte d'avant.
  function changerRecherche(texte) {
    if (!enregistrerModificationEnCours()) {
      Interface.afficherRecherche(etat.recherche);
      return;
    }
    etat.recherche = texte;
    rafraichir();
  }

  // ---------- Connexion (sprint 3) ----------

  // Comptes enregistrés, sans les comptes illisibles. Relus à chaque fois dans
  // le stockage, pour tenir compte d'un compte créé ou bloqué dans un autre onglet.
  function chargerUtilisateurs() {
    return Auth.nettoyerUtilisateurs(Stockage.chargerUtilisateurs());
  }

  // Premier lancement (stories 12, 13 et 15) : création du compte de test.
  // Le mot de passe n'est gardé nulle part : il est haché, puis seule l'empreinte est enregistrée.
  // async : on attend (await) le hachage, qui est asynchrone.
  async function creerCompte(donnees) {
    if (chargerUtilisateurs().length > 0) {
      // Compte déjà créé (par exemple dans un autre onglet) : on ne le remplace pas.
      Interface.viderFormulaireCreation();
      Interface.afficherEcran("connexion");
      return;
    }
    const resultat = Auth.validerCreation(donnees.motDePasse, donnees.confirmation);
    if (!resultat.valide) {
      Interface.afficherErreurCreation(resultat.message);
      return; // le compte n'est pas créé
    }
    const hachage = Auth.verifierHachage();
    if (!hachage.valide) {
      Interface.afficherErreurCreation(hachage.message);
      return; // jamais de mot de passe en clair à la place
    }
    const empreinte = await Auth.hacher(donnees.motDePasse);
    const utilisateurs = Auth.creerUtilisateur([], Auth.IDENTIFIANT_TEST, empreinte);
    if (!Stockage.sauverUtilisateurs(utilisateurs)) {
      Interface.afficherErreurCreation(Interface.MESSAGE_SAUVEGARDE_COMPTE);
      return;
    }
    // Compte créé : cet écran ne réapparaîtra plus, on passe à la connexion.
    Interface.viderFormulaireCreation();
    Interface.afficherEcran("connexion");
  }

  // Story 12 : bouton « Se connecter » ou touche Entrée.
  async function seConnecter(donnees) {
    const resultat = Auth.validerConnexion(donnees.identifiant, donnees.motDePasse);
    if (!resultat.valide) {
      Interface.afficherErreurConnexion(resultat.message);
      return; // champ vide : aucune tentative de connexion
    }
    const hachage = Auth.verifierHachage();
    if (!hachage.valide) {
      Interface.afficherErreurConnexion(hachage.message);
      return;
    }
    // Le mot de passe saisi est haché, puis comparé à l'empreinte enregistrée (story 15)
    const empreinte = await Auth.hacher(donnees.motDePasse);
    const connexion = Auth.connecter(chargerUtilisateurs(), donnees.identifiant, empreinte);
    Interface.viderMotDePasseConnexion(); // le mot de passe ne reste pas dans le champ
    if (!connexion.reussi) {
      Interface.afficherErreurConnexion(connexion.message);
      return;
    }
    ouvrirSession(connexion.identifiant);
  }

  // Après une connexion réussie, ou au rechargement si la session existe déjà :
  // on retient l'utilisateur, on charge les tâches (story 7) et on affiche leur écran.
  function ouvrirSession(identifiant) {
    etat.utilisateur = identifiant;
    Stockage.ecrireSession(identifiant); // l'identifiant seulement
    etat.taches = Taches.nettoyerListe(Stockage.chargerTaches());
    Interface.afficherUtilisateur(identifiant);
    Interface.afficherEcran("taches");
    rafraichir();
  }

  // Bouton « Se déconnecter ». Comme les autres actions, une modification en cours
  // est d'abord enregistrée (si le titre est refusé, on reste connecté).
  function seDeconnecter() {
    if (!enregistrerModificationEnCours()) {
      return;
    }
    Stockage.effacerSession();
    // On repart d'un état vide, comme après un rechargement : les tâches ne restent
    // pas dans la page, et le filtre, le tri et la recherche reviennent par défaut.
    etat.utilisateur = "";
    etat.taches = [];
    etat.filtre = "all";
    etat.tri = "recent";
    etat.recherche = "";
    rafraichir();
    Interface.afficherEcran("connexion");
  }

  // ---------- Démarrage ----------

  function demarrer() {
    // On branche les événements des trois écrans
    Interface.surCreation(creerCompte);
    Interface.surConnexion(seConnecter);
    Interface.surDeconnexion(seDeconnecter);
    Interface.surAjout(ajouterTache);
    Interface.surActionListe(traiterActionListe);
    Interface.surModification(enregistrerModification, annulerModification);
    Interface.surFiltre(changerFiltre);
    Interface.surTri(changerTri);
    Interface.surRecherche(changerRecherche);

    // Quel écran afficher ?
    const utilisateurs = chargerUtilisateurs();
    if (utilisateurs.length === 0) {
      // Aucun compte : premier lancement, on choisit le mot de passe du compte de test
      Interface.afficherEcran("creation");
      return;
    }
    // Session encore ouverte dans cet onglet (rechargement) : pas besoin de se reconnecter
    const session = Stockage.lireSession();
    if (Auth.trouver(utilisateurs, session) !== undefined) {
      ouvrirSession(session);
    } else {
      Interface.afficherEcran("connexion");
    }
  }

  demarrer();
})();
