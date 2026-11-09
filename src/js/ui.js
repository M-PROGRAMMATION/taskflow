/*
 * ui.js — objet Interface
 * Tout l'accès au DOM : afficher la liste, lire les formulaires, afficher les erreurs,
 * la jauge, la fenêtre de confirmation, basculer entre les écrans.
 * Les classes CSS (task, badge-high…) viennent de la maquette Claude Design.
 * Toujours textContent / createElement, jamais innerHTML (XSS).
 * Dépend de : Utils.
 * Pas de règle métier ici.
 */
const Interface = {
  // Traduction des codes enregistrés (anglais) en texte affiché (français)
  LIBELLES_PRIORITE: { high: "Haute", medium: "Moyenne", low: "Basse" },
  LIBELLES_ECHEANCE: { late: "En retard", today: "Aujourd'hui" },
  LIBELLES_CATEGORIE: { school: "Cours", personal: "Perso", project: "Projet" },
  LIBELLES_JAUGE: { weak: "Faible", medium: "Moyen", strong: "Fort" },
  // Titre de l'onglet du navigateur pour chaque écran
  TITRES_ECRAN: { creation: "Premier lancement", connexion: "Connexion", taches: "Mes tâches" },
  // Messages de liste vide : aucune tâche du tout (story 2), ou filtre sans résultat (story 8).
  // Le message de la recherche (story 11) contient le mot-clé : il est construit dans afficherMessageVide.
  // Message affiché si le compte n'a pas pu être enregistré (stockage bloqué ou plein)
  MESSAGE_SAUVEGARDE_COMPTE:
    "Le compte n'a pas pu être enregistré : le stockage du navigateur est bloqué ou plein.",
  MESSAGES_VIDE: {
    aucune: "Aucune tâche pour le moment. Ajoutez-en une avec le formulaire.",
    todo: "Aucune tâche à faire.",
    done: "Aucune tâche terminée.",
  },

  // Crée un élément HTML avec une classe et un texte.
  // Le texte passe par textContent : du HTML tapé par l'utilisateur s'affiche tel quel.
  creerElement: function (balise, classe, texte) {
    const element = document.createElement(balise);
    if (classe) {
      element.className = classe;
    }
    if (texte !== undefined) {
      element.textContent = texte;
    }
    return element;
  },

  // Crée un bouton qui ne contient qu'une icône (modifier, supprimer).
  // action : valeur de data-action, lue par app.js pour savoir quel bouton a été cliqué.
  // classe : classe en plus de "btn-icon" (ex. "is-danger" pour la corbeille), ou "".
  creerBoutonIcone: function (action, icone, libelle, classe) {
    const bouton = Interface.creerElement("button", ("btn-icon " + classe).trim());
    bouton.type = "button";
    bouton.dataset.action = action;
    bouton.title = libelle;
    bouton.setAttribute("aria-label", libelle); // lu par les lecteurs d'écran

    const image = document.createElement("img");
    image.src = "assets/icones/" + icone;
    image.alt = ""; // l'image est décorative, le libellé est sur le bouton
    image.width = 18;
    image.height = 18;
    bouton.appendChild(image);
    return bouton;
  },

  // Construit la ligne <li> d'une tâche.
  // etatEcheance : "late", "today" ou "" (calculé par Taches.etatEcheance).
  creerLigneTache: function (tache, etatEcheance) {
    const ligne = Interface.creerElement("li", "task");
    ligne.dataset.id = tache.id; // permet de retrouver la tâche au clic
    const terminee = tache.status === "done";
    if (terminee) {
      ligne.classList.add("is-done");
    }

    // Case à cocher pour terminer la tâche, dans un <label> qui agrandit la zone cliquable
    const zoneCase = Interface.creerElement("label", "task-check");
    const caseACocher = document.createElement("input");
    caseACocher.type = "checkbox";
    caseACocher.dataset.action = "terminer";
    caseACocher.checked = terminee;
    const texteCase = terminee ? "Remettre à faire « " : "Terminer « ";
    caseACocher.setAttribute("aria-label", texteCase + tache.title + " »");
    zoneCase.appendChild(caseACocher);
    ligne.appendChild(zoneCase);

    // Titre, description, puis les badges (priorité, catégorie, date, échéance)
    const contenu = Interface.creerElement("div", "task-body");
    contenu.appendChild(Interface.creerElement("span", "task-title", tache.title));
    if (tache.description !== "") {
      contenu.appendChild(Interface.creerElement("span", "task-desc", tache.description));
    }

    const badges = Interface.creerElement("div", "badges");
    badges.appendChild(
      Interface.creerElement(
        "span",
        "badge badge-" + tache.priority,
        Interface.LIBELLES_PRIORITE[tache.priority]
      )
    );
    // Badge de catégorie (story 10), seulement si la tâche en a une
    if (tache.category !== "") {
      badges.appendChild(
        Interface.creerElement(
          "span",
          "badge tag tag-" + tache.category,
          Interface.LIBELLES_CATEGORIE[tache.category]
        )
      );
    }
    // Date avec une icône calendrier (ajoutée par le CSS) ; en gris si « Sans date » ou terminée
    const texteDate = tache.dueDate === "" ? "Sans date" : Utils.formaterDate(tache.dueDate);
    const date = Interface.creerElement("span", "due", texteDate);
    if (tache.dueDate === "" || terminee) {
      date.classList.add("is-empty");
    }
    badges.appendChild(date);
    if (etatEcheance !== "") {
      badges.appendChild(
        Interface.creerElement(
          "span",
          "badge badge-" + etatEcheance,
          Interface.LIBELLES_ECHEANCE[etatEcheance]
        )
      );
    }
    contenu.appendChild(badges);
    ligne.appendChild(contenu);

    // Boutons d'action
    const actions = Interface.creerElement("div", "task-actions");
    actions.appendChild(
      Interface.creerBoutonIcone("modifier", "modifier.svg", "Modifier « " + tache.title + " »", "")
    );
    actions.appendChild(
      Interface.creerBoutonIcone(
        "supprimer",
        "corbeille.svg",
        "Supprimer « " + tache.title + " »",
        "is-danger"
      )
    );
    ligne.appendChild(actions);

    return ligne;
  },

  // Crée un champ (libellé + élément de saisie) pour le formulaire de modification.
  creerChamp: function (classe, libelle, champ) {
    const bloc = Interface.creerElement("div", classe);
    const etiquette = Interface.creerElement("label", "label", libelle);
    etiquette.htmlFor = champ.id; // relie le libellé au champ (clic sur le libellé = focus)
    bloc.appendChild(etiquette);
    bloc.appendChild(champ);
    return bloc;
  },

  // Crée une liste déroulante <select> à partir d'un objet { code: libellé }.
  // Si texteVide est donné, une première option de valeur "" est ajoutée (ex. « Aucune »).
  creerListe: function (id, libelles, texteVide) {
    const liste = Interface.creerElement("select", "select");
    liste.id = id;
    if (texteVide !== undefined) {
      const optionVide = Interface.creerElement("option", "", texteVide);
      optionVide.value = "";
      liste.appendChild(optionVide);
    }
    // Object.keys donne les codes dans l'ordre où ils sont écrits (ex. high, medium, low)
    Object.keys(libelles).forEach(function (code) {
      const option = Interface.creerElement("option", "", libelles[code]);
      option.value = code;
      liste.appendChild(option);
    });
    return liste;
  },

  // Crée un champ de saisie <input> avec la classe de la maquette.
  creerSaisie: function (type, id, valeur) {
    const saisie = Interface.creerElement("input", "input");
    saisie.type = type;
    saisie.id = id;
    saisie.value = valeur; // value, comme textContent, n'interprète pas le HTML
    return saisie;
  },

  // Construit la ligne d'une tâche en cours de modification (story 4) :
  // un petit formulaire déjà rempli avec les valeurs actuelles.
  // Une seule tâche est modifiée à la fois, les id des champs sont donc uniques.
  creerLigneModification: function (tache) {
    const ligne = Interface.creerElement("li", "task-edit");
    ligne.dataset.id = tache.id;

    const formulaire = Interface.creerElement("form", "formulaire-modification");
    formulaire.noValidate = true; // validation faite par Taches.valider
    formulaire.setAttribute("aria-label", "Modifier la tâche");

    // En-tête : « Modification » et rappel de la touche Échap
    const entete = Interface.creerElement("div", "task-edit-head");
    entete.appendChild(Interface.creerElement("span", "eyebrow", "Modification"));
    const aide = Interface.creerElement("span", "task-edit-hint");
    aide.appendChild(Interface.creerElement("kbd", "", "Échap"));
    aide.appendChild(document.createTextNode(" pour annuler"));
    entete.appendChild(aide);
    formulaire.appendChild(entete);

    const titre = Interface.creerSaisie("text", "modif-titre", tache.title);
    titre.maxLength = 100;
    titre.autocomplete = "off";
    titre.setAttribute("aria-describedby", "erreur-modif");
    const blocTitre = Interface.creerChamp("field", "Titre", titre);
    const erreur = Interface.creerElement("p", "field-error");
    erreur.id = "erreur-modif";
    erreur.setAttribute("role", "alert");
    erreur.hidden = true;
    blocTitre.appendChild(erreur);
    formulaire.appendChild(blocTitre);

    const description = Interface.creerSaisie("text", "modif-description", tache.description);
    description.autocomplete = "off";
    formulaire.appendChild(Interface.creerChamp("field", "Description", description));

    // Priorité, échéance et catégorie sur une ligne (ou les unes sous les autres sur téléphone)
    const rangee = Interface.creerElement("div", "field-row-auto");
    const priorite = Interface.creerListe("modif-priorite", Interface.LIBELLES_PRIORITE);
    priorite.value = tache.priority; // sélectionne la priorité actuelle
    rangee.appendChild(Interface.creerChamp("field", "Priorité", priorite));

    const echeance = Interface.creerSaisie("date", "modif-echeance", tache.dueDate);
    rangee.appendChild(Interface.creerChamp("field", "Échéance", echeance));

    // Catégorie (story 10) : « Aucune » en premier, puis Cours, Perso, Projet
    const categorie = Interface.creerListe("modif-categorie", Interface.LIBELLES_CATEGORIE, "Aucune");
    categorie.value = tache.category; // sélectionne la catégorie actuelle ("" = Aucune)
    rangee.appendChild(Interface.creerChamp("field", "Catégorie", categorie));
    formulaire.appendChild(rangee);

    const boutons = Interface.creerElement("div", "task-edit-actions");
    const annuler = Interface.creerElement("button", "btn btn-secondary", "Annuler");
    annuler.type = "button";
    annuler.dataset.action = "annuler"; // traité par la délégation de clic, comme la corbeille
    const enregistrer = Interface.creerElement("button", "btn btn-primary", "Enregistrer");
    enregistrer.type = "submit";
    boutons.appendChild(annuler);
    boutons.appendChild(enregistrer);
    formulaire.appendChild(boutons);

    ligne.appendChild(formulaire);
    return ligne;
  },

  // Réaffiche toute la liste.
  // echeances : objet { id: "late" | "today" | "" } préparé par app.js.
  // idEnModification : id de la tâche affichée en formulaire, ou null.
  afficherTaches: function (taches, echeances, idEnModification) {
    const liste = document.getElementById("liste-taches");
    liste.textContent = ""; // vide la liste avant de la reconstruire

    taches.forEach(function (tache) {
      if (tache.id === idEnModification) {
        liste.appendChild(Interface.creerLigneModification(tache));
      } else {
        liste.appendChild(Interface.creerLigneTache(tache, echeances[tache.id]));
      }
    });
  },

  // Affiche le message de liste vide qui correspond à cas
  // ("aucune", "todo", "done", "recherche"), ou le cache si cas vaut "".
  // motCle : le mot recherché, repris dans le message de la story 11.
  // « aucune » : grand message avec une illustration ; filtre ou recherche : cadre en pointillés.
  afficherMessageVide: function (cas, motCle) {
    const bloc = document.getElementById("message-vide");
    const texte = document.getElementById("message-vide-texte");
    bloc.hidden = cas === "";
    bloc.className = cas === "aucune" ? "empty" : "empty-box";
    if (cas === "") {
      texte.textContent = "";
    } else if (cas === "recherche") {
      // textContent : un mot-clé contenant du HTML s'affiche tel quel
      texte.textContent = "Aucune tâche ne correspond à « " + motCle + " ».";
    } else {
      texte.textContent = Interface.MESSAGES_VIDE[cas];
    }
  },

  // ---------- Filtres (story 8) ----------

  // Met en évidence le bouton du filtre actif. aria-pressed indique aussi
  // aux lecteurs d'écran quel bouton est enfoncé ; le CSS s'en sert pour la couleur.
  afficherFiltre: function (filtre) {
    document.querySelectorAll("#filtres [data-filtre]").forEach(function (bouton) {
      bouton.setAttribute("aria-pressed", String(bouton.dataset.filtre === filtre));
    });
  },

  // Un seul écouteur sur le groupe de boutons : traiter(filtre) reçoit
  // "all", "todo" ou "done", lu dans le data-filtre du bouton cliqué.
  surFiltre: function (traiter) {
    document.getElementById("filtres").addEventListener("click", function (evenement) {
      const bouton = evenement.target.closest("[data-filtre]");
      if (bouton !== null) {
        traiter(bouton.dataset.filtre);
      }
    });
  },

  // ---------- Tri (story 9) ----------

  // Sélectionne le tri actif dans la liste « Trier par ».
  afficherTri: function (tri) {
    document.getElementById("tri").value = tri;
  },

  // traiter(tri) reçoit "recent", "priority" ou "dueDate" à chaque changement de choix.
  surTri: function (traiter) {
    const liste = document.getElementById("tri");
    liste.addEventListener("change", function () {
      traiter(liste.value);
    });
  },

  // ---------- Recherche (story 11) ----------

  // Remet dans le champ le texte de l'état (par exemple "" après un ajout).
  // On ne réécrit que si le texte est différent, pour ne pas déplacer le curseur pendant la frappe.
  afficherRecherche: function (texte) {
    const champ = document.getElementById("recherche");
    if (champ.value !== texte) {
      champ.value = texte;
    }
  },

  // traiter(texte) est appelée à chaque caractère tapé ou effacé (événement input).
  surRecherche: function (traiter) {
    const champ = document.getElementById("recherche");
    champ.addEventListener("input", function () {
      traiter(champ.value);
    });
  },

  // ---------- Formulaire de modification (story 4) ----------

  // Lit les valeurs du formulaire de modification.
  lireFormulaireModification: function () {
    return {
      title: document.getElementById("modif-titre").value,
      description: document.getElementById("modif-description").value,
      priority: document.getElementById("modif-priorite").value,
      dueDate: document.getElementById("modif-echeance").value,
      category: document.getElementById("modif-categorie").value,
    };
  },

  // Met le curseur dans le titre du formulaire de modification.
  focaliserModification: function () {
    const titre = document.getElementById("modif-titre");
    if (titre !== null) {
      titre.focus();
    }
  },

  // Affiche le message d'erreur sous le titre du formulaire de modification.
  afficherErreurModification: function (message) {
    const erreur = document.getElementById("erreur-modif");
    erreur.textContent = message;
    erreur.hidden = false;
    const titre = document.getElementById("modif-titre");
    titre.setAttribute("aria-invalid", "true");
    titre.focus();
  },

  // Branche le formulaire de modification. Il est recréé à chaque affichage :
  // on écoute donc la liste, qui reçoit les événements de ses enfants (délégation).
  //   enregistrer() : bouton « Enregistrer » ou touche Entrée (app.js relit le formulaire)
  //   annuler()            : touche Échap (le bouton « Annuler » passe par surActionListe)
  surModification: function (enregistrer, annuler) {
    const liste = document.getElementById("liste-taches");
    liste.addEventListener("submit", function (evenement) {
      evenement.preventDefault(); // empêche le rechargement de la page
      enregistrer();
    });
    liste.addEventListener("keydown", function (evenement) {
      if (evenement.key === "Escape" && evenement.target.closest(".formulaire-modification")) {
        annuler();
      }
    });
  },

  // Branche UN SEUL écouteur de clic sur toute la liste (délégation d'événements).
  // Un clic sur un élément qui a un data-action (case, crayon, corbeille…) appelle
  // traiter(action, id), où id est l'identifiant de la tâche de la ligne cliquée.
  // Si traiter renvoie false, le clic est annulé (la case à cocher ne change pas).
  surActionListe: function (traiter) {
    document.getElementById("liste-taches").addEventListener("click", function (evenement) {
      const element = evenement.target.closest("[data-action]");
      if (element === null) {
        return; // clic ailleurs que sur un bouton ou une case
      }
      const ligne = element.closest("li[data-id]");
      const accepte = traiter(element.dataset.action, Number(ligne.dataset.id)); // dataset donne du texte
      if (accepte === false) {
        evenement.preventDefault(); // remet la case dans son état d'avant le clic
      }
    });
  },

  // Après un réaffichage, la ligne est recréée et le focus clavier est perdu :
  // on le remet sur l'élément action de la tâche id (utile pour la touche Tab).
  remettreFocus: function (id, action) {
    const element = document.querySelector('li[data-id="' + id + '"] [data-action="' + action + '"]');
    if (element !== null) {
      element.focus();
    }
  },

  // Demande confirmation avant une suppression (story 6), dans la fenêtre <dialog> de index.html.
  // La fenêtre ne bloque pas le code comme confirm() : siConfirme() est appelée plus tard,
  // seulement si l'utilisateur clique sur « Supprimer ». « Annuler » ou Échap ne font rien.
  confirmerSuppression: function (titre, siConfirme) {
    const fenetre = document.getElementById("fenetre-suppression");
    // Navigateur trop ancien pour <dialog> : on revient à confirm(), standard partout
    if (typeof fenetre.showModal !== "function") {
      if (window.confirm("Supprimer la tâche « " + titre + " » ?")) {
        siConfirme();
      }
      return;
    }
    document.getElementById("fenetre-suppression-titre").textContent =
      "Supprimer la tâche « " + titre + " » ?";
    fenetre.returnValue = ""; // Échap ferme sans changer returnValue : on le vide avant
    // once: true : l'écouteur est retiré après la fermeture, il ne s'accumule pas
    fenetre.addEventListener(
      "close",
      function () {
        if (fenetre.returnValue === "supprimer") {
          siConfirme();
        }
      },
      { once: true }
    );
    fenetre.showModal();
    // Le curseur va sur « Annuler » : une touche Entrée par erreur ne supprime rien
    fenetre.querySelector('button[value="annuler"]').focus();
  },

  // ---------- Formulaire d'ajout (story 1) ----------

  // Lit les valeurs du formulaire d'ajout, telles que saisies (Taches les vérifie).
  lireFormulaireAjout: function () {
    return {
      title: document.getElementById("ajout-titre").value,
      description: document.getElementById("ajout-description").value,
      priority: document.getElementById("ajout-priorite").value,
      dueDate: document.getElementById("ajout-echeance").value,
      category: document.getElementById("ajout-categorie").value,
    };
  },

  // Affiche le message d'erreur sous le champ titre.
  afficherErreurAjout: function (message) {
    const erreur = document.getElementById("erreur-ajout");
    erreur.textContent = message;
    erreur.hidden = false;
    const champTitre = document.getElementById("ajout-titre");
    champTitre.setAttribute("aria-invalid", "true");
    champTitre.focus();
  },

  // Affiche « 12 / 100 » au-dessus du champ titre.
  afficherNombreCaracteres: function () {
    const titre = document.getElementById("ajout-titre");
    document.getElementById("ajout-nombre-caracteres").textContent =
      titre.value.length + " / " + titre.maxLength;
  },

  // Cache le message d'erreur du formulaire d'ajout.
  effacerErreurAjout: function () {
    const erreur = document.getElementById("erreur-ajout");
    erreur.textContent = "";
    erreur.hidden = true;
    document.getElementById("ajout-titre").removeAttribute("aria-invalid");
  },

  // Vide le formulaire (la priorité revient sur « Moyenne », la catégorie sur « Aucune »)
  // et remet le curseur dans le titre.
  viderFormulaireAjout: function () {
    document.getElementById("formulaire-ajout").reset();
    Interface.effacerErreurAjout();
    Interface.afficherNombreCaracteres(); // reset() ne déclenche pas l'événement input
    document.getElementById("ajout-titre").focus();
  },

  // Branche le formulaire d'ajout : traiter(donnees) est appelée à chaque envoi
  // (bouton « Ajouter » ou touche Entrée dans un champ).
  surAjout: function (traiter) {
    document.getElementById("formulaire-ajout").addEventListener("submit", function (evenement) {
      evenement.preventDefault(); // empêche le navigateur de recharger la page
      traiter(Interface.lireFormulaireAjout());
    });
    // L'erreur disparaît dès que l'utilisateur corrige le titre, et le nombre de caractères suit
    const titre = document.getElementById("ajout-titre");
    titre.addEventListener("input", Interface.effacerErreurAjout);
    titre.addEventListener("input", Interface.afficherNombreCaracteres);
  },

  // ---------- Compteur ----------

  // Affiche « 3 tâches à faire », « 1 tâche à faire » ou « 0 tâche(s) à faire »
  // (décision du binôme : « (s) » pour 0, l'accord n'étant pas évident).
  afficherCompteur: function (nombre) {
    let mot = "tâches";
    if (nombre === 0) {
      mot = "tâche(s)";
    } else if (nombre === 1) {
      mot = "tâche";
    }
    const compteur = document.getElementById("compteur");
    compteur.querySelector(".counter-number").textContent = nombre;
    compteur.querySelector(".counter-label").textContent = mot + " à faire";
  },

  // ---------- Écrans (sprint 3) ----------

  // Affiche un seul écran et cache les deux autres.
  // nom : "creation" (premier lancement), "connexion" ou "taches".
  // Le curseur est placé dans le premier champ utile de l'écran affiché.
  afficherEcran: function (nom) {
    document.title = "TaskFlow · " + Interface.TITRES_ECRAN[nom];
    document.getElementById("ecran-creation").hidden = nom !== "creation";
    document.getElementById("ecran-connexion").hidden = nom !== "connexion";
    document.getElementById("ecran-taches").hidden = nom !== "taches";

    if (nom === "creation") {
      document.getElementById("creation-mdp").focus();
    } else if (nom === "connexion") {
      const identifiant = document.getElementById("connexion-identifiant");
      // Si l'identifiant est déjà rempli, on passe directement au mot de passe
      if (identifiant.value === "") {
        identifiant.focus();
      } else {
        document.getElementById("connexion-mdp").focus();
      }
    } else {
      document.getElementById("ajout-titre").focus();
    }
  },

  // Affiche un message d'erreur dans le paragraphe idErreur (textContent : pas de HTML).
  afficherMessageErreur: function (idErreur, message) {
    const erreur = document.getElementById(idErreur);
    erreur.textContent = message;
    erreur.hidden = false;
  },

  // Cache le message d'erreur du paragraphe idErreur.
  effacerMessageErreur: function (idErreur) {
    const erreur = document.getElementById(idErreur);
    erreur.textContent = "";
    erreur.hidden = true;
  },

  // ---------- Premier lancement : choix du mot de passe (stories 12 et 13) ----------

  // Lit le mot de passe et sa confirmation, tels que tapés (sans trim : un espace compte).
  // Les valeurs ne sont gardées nulle part : app.js les passe directement à Auth.
  lireFormulaireCreation: function () {
    return {
      motDePasse: document.getElementById("creation-mdp").value,
      confirmation: document.getElementById("creation-confirmation").value,
    };
  },

  // Affiche l'erreur (règles manquantes, confirmation différente…) et remet le curseur
  // dans le premier champ.
  afficherErreurCreation: function (message) {
    Interface.afficherMessageErreur("erreur-creation", message);
    const champ = document.getElementById("creation-mdp");
    champ.setAttribute("aria-invalid", "true");
    champ.focus();
  },

  effacerErreurCreation: function () {
    Interface.effacerMessageErreur("erreur-creation");
    document.getElementById("creation-mdp").removeAttribute("aria-invalid");
  },

  // Vide les deux champs : le mot de passe ne reste pas à l'écran.
  viderFormulaireCreation: function () {
    document.getElementById("formulaire-creation").reset();
    Interface.effacerErreurCreation();
    // reset() ne déclenche pas l'événement input : on vide la jauge et les règles à la main
    Interface.afficherJauge("");
    Interface.afficherRegles([false, false, false, false]);
  },

  // Story 14 : met la jauge au niveau "", "weak", "medium" ou "strong" (calculé par Auth).
  // Le CSS lit data-niveau pour colorer 1, 2 ou 3 barres ; le mot est écrit à côté.
  // Champ vide : aucune barre colorée et aucun mot.
  afficherJauge: function (niveau) {
    document.getElementById("jauge").dataset.niveau = niveau;
    const texte = niveau === "" ? "" : Interface.LIBELLES_JAUGE[niveau];
    document.getElementById("jauge-texte").textContent = texte;
  },

  // Story 13 : coche chaque règle respectée sous le champ.
  // respectees : tableau de 4 booléens, dans l'ordre des <li> (calculé par Auth.reglesRespectees).
  afficherRegles: function (respectees) {
    const lignes = document.querySelectorAll("#regles li");
    lignes.forEach(function (ligne, index) {
      ligne.classList.toggle("is-ok", respectees[index]);
    });
  },

  // traiter(motDePasse) est appelée à chaque caractère tapé ou effacé dans le mot de passe.
  surSaisieMotDePasse: function (traiter) {
    const champ = document.getElementById("creation-mdp");
    champ.addEventListener("input", function () {
      traiter(champ.value);
    });
  },

  // traiter(donnees) est appelée au clic sur « Créer le compte » ou avec la touche Entrée.
  surCreation: function (traiter) {
    const formulaire = document.getElementById("formulaire-creation");
    formulaire.addEventListener("submit", function (evenement) {
      evenement.preventDefault(); // empêche le rechargement de la page
      traiter(Interface.lireFormulaireCreation());
    });
    // L'erreur disparaît dès que l'utilisateur modifie un des deux champs
    formulaire.addEventListener("input", Interface.effacerErreurCreation);
  },

  // ---------- Connexion (story 12) ----------

  // Lit l'identifiant et le mot de passe tels que tapés (Auth les vérifie).
  lireFormulaireConnexion: function () {
    return {
      identifiant: document.getElementById("connexion-identifiant").value,
      motDePasse: document.getElementById("connexion-mdp").value,
    };
  },

  afficherErreurConnexion: function (message) {
    Interface.afficherMessageErreur("erreur-connexion", message);
    document.getElementById("erreur-connexion").classList.remove("alert-locked");
  },

  // L'erreur disparaît quand on tape, sauf le message de blocage, qui reste jusqu'à la fin.
  effacerErreurConnexion: function () {
    if (document.getElementById("erreur-connexion").classList.contains("alert-locked")) {
      return;
    }
    Interface.effacerMessageErreur("erreur-connexion");
  },

  // Story 16 : bandeau « Compte bloqué » avec un cadenas, et bouton « Se connecter » désactivé.
  afficherBlocageConnexion: function (message) {
    Interface.afficherMessageErreur("erreur-connexion", message);
    document.getElementById("erreur-connexion").classList.add("alert-locked");
    document.getElementById("bouton-connexion").disabled = true;
  },

  // Fin du blocage : le bandeau disparaît et le bouton fonctionne à nouveau.
  leverBlocageConnexion: function () {
    document.getElementById("erreur-connexion").classList.remove("alert-locked");
    Interface.effacerMessageErreur("erreur-connexion");
    document.getElementById("bouton-connexion").disabled = false;
  },

  // Vide le champ mot de passe (après une connexion réussie ou refusée)
  // et y remet le curseur. L'identifiant est gardé.
  viderMotDePasseConnexion: function () {
    const champ = document.getElementById("connexion-mdp");
    champ.value = "";
    champ.focus();
  },

  // traiter(donnees) est appelée au clic sur « Se connecter » ou avec la touche Entrée.
  surConnexion: function (traiter) {
    const formulaire = document.getElementById("formulaire-connexion");
    formulaire.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      traiter(Interface.lireFormulaireConnexion());
    });
    formulaire.addEventListener("input", Interface.effacerErreurConnexion);
  },

  // Affiche l'utilisateur connecté dans la barre du haut : son initiale dans un rond, puis son nom.
  // Un texte caché « Connecté : » est lu par les lecteurs d'écran avant le nom.
  afficherUtilisateur: function (identifiant) {
    document.getElementById("utilisateur-initiale").textContent = identifiant.charAt(0).toUpperCase();
    document.getElementById("utilisateur-connecte").textContent = identifiant;
  },

  // Affiche la date du jour au-dessus du titre « Mes tâches » (texte préparé par Utils).
  afficherDateDuJour: function (texte) {
    document.getElementById("date-du-jour").textContent = texte;
  },

  // traiter() est appelée au clic sur « Se déconnecter ».
  surDeconnexion: function (traiter) {
    document.getElementById("bouton-deconnexion").addEventListener("click", function () {
      traiter();
    });
  },
};
