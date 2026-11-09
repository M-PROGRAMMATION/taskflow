/*
 * ui.js — objet Interface
 * Tout l'accès au DOM : afficher la liste, lire le formulaire, afficher les erreurs,
 * la jauge, basculer entre les écrans.
 * Toujours textContent / createElement, jamais innerHTML (XSS).
 * Dépend de : Utils.
 * Pas de règle métier ici.
 */
const Interface = {
  // Traduction des codes enregistrés (anglais) en texte affiché (français)
  LIBELLES_PRIORITE: { high: "Haute", medium: "Moyenne", low: "Basse" },
  LIBELLES_ECHEANCE: { late: "En retard", today: "Aujourd'hui" },
  LIBELLES_CATEGORIE: { school: "Cours", personal: "Perso", project: "Projet" },
  // Messages de liste vide : aucune tâche du tout (story 2), ou filtre sans résultat (story 8).
  // Le message de la recherche (story 11) contient le mot-clé : il est construit dans afficherMessageVide.
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
  creerBoutonIcone: function (action, icone, libelle) {
    const bouton = Interface.creerElement("button", "bouton-icone");
    bouton.type = "button";
    bouton.dataset.action = action;
    bouton.title = libelle;
    bouton.setAttribute("aria-label", libelle); // lu par les lecteurs d'écran

    const image = document.createElement("img");
    image.src = "assets/icones/" + icone;
    image.alt = ""; // l'image est décorative, le libellé est sur le bouton
    bouton.appendChild(image);
    return bouton;
  },

  // Construit la ligne <li> d'une tâche.
  // etatEcheance : "late", "today" ou "" (calculé par Taches.etatEcheance).
  creerLigneTache: function (tache, etatEcheance) {
    const ligne = Interface.creerElement("li", "tache");
    ligne.dataset.id = tache.id; // permet de retrouver la tâche au clic
    if (tache.status === "done") {
      ligne.classList.add("tache-terminee");
    }

    // Case à cocher pour terminer la tâche
    const caseACocher = document.createElement("input");
    caseACocher.type = "checkbox";
    caseACocher.className = "tache-case";
    caseACocher.dataset.action = "terminer";
    caseACocher.checked = tache.status === "done";
    caseACocher.setAttribute("aria-label", "Terminer « " + tache.title + " »");
    ligne.appendChild(caseACocher);

    // Titre, description, puis la ligne d'informations (priorité, date, badge)
    const contenu = Interface.creerElement("div", "tache-contenu");
    contenu.appendChild(Interface.creerElement("p", "tache-titre", tache.title));
    if (tache.description !== "") {
      contenu.appendChild(Interface.creerElement("p", "tache-description", tache.description));
    }

    const infos = Interface.creerElement("div", "tache-infos");
    infos.appendChild(
      Interface.creerElement(
        "span",
        "badge priorite-" + tache.priority,
        Interface.LIBELLES_PRIORITE[tache.priority]
      )
    );
    // Badge de catégorie (story 10), seulement si la tâche en a une
    if (tache.category !== "") {
      infos.appendChild(
        Interface.creerElement(
          "span",
          "badge categorie-" + tache.category,
          Interface.LIBELLES_CATEGORIE[tache.category]
        )
      );
    }
    const texteDate = tache.dueDate === "" ? "Sans date" : Utils.formaterDate(tache.dueDate);
    infos.appendChild(Interface.creerElement("span", "tache-date", texteDate));
    if (etatEcheance !== "") {
      infos.appendChild(
        Interface.creerElement(
          "span",
          "badge echeance-" + etatEcheance,
          Interface.LIBELLES_ECHEANCE[etatEcheance]
        )
      );
    }
    contenu.appendChild(infos);
    ligne.appendChild(contenu);

    // Boutons d'action
    const actions = Interface.creerElement("div", "tache-actions");
    actions.appendChild(
      Interface.creerBoutonIcone("modifier", "modifier.svg", "Modifier « " + tache.title + " »")
    );
    actions.appendChild(
      Interface.creerBoutonIcone("supprimer", "corbeille.svg", "Supprimer « " + tache.title + " »")
    );
    ligne.appendChild(actions);

    return ligne;
  },

  // Crée un champ (libellé + élément de saisie) pour le formulaire de modification.
  creerChamp: function (classe, libelle, champ) {
    const bloc = Interface.creerElement("div", classe);
    const etiquette = Interface.creerElement("label", "", libelle);
    etiquette.htmlFor = champ.id; // relie le libellé au champ (clic sur le libellé = focus)
    bloc.appendChild(etiquette);
    bloc.appendChild(champ);
    return bloc;
  },

  // Crée une liste déroulante <select> à partir d'un objet { code: libellé }.
  // Si texteVide est donné, une première option de valeur "" est ajoutée (ex. « Aucune »).
  creerListe: function (id, libelles, texteVide) {
    const liste = document.createElement("select");
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

  // Construit la ligne d'une tâche en cours de modification (story 4) :
  // un petit formulaire déjà rempli avec les valeurs actuelles.
  // Une seule tâche est modifiée à la fois, les id des champs sont donc uniques.
  creerLigneModification: function (tache) {
    const ligne = Interface.creerElement("li", "tache tache-en-modification");
    ligne.dataset.id = tache.id;

    const formulaire = Interface.creerElement("form", "formulaire formulaire-modification");
    formulaire.noValidate = true; // validation faite par Taches.valider

    const titre = document.createElement("input");
    titre.type = "text";
    titre.id = "modif-titre";
    titre.maxLength = 100;
    titre.autocomplete = "off";
    titre.value = tache.title; // value, comme textContent, n'interprète pas le HTML
    titre.setAttribute("aria-describedby", "erreur-modif");
    const blocTitre = Interface.creerChamp("champ champ-large", "Titre", titre);
    const erreur = Interface.creerElement("p", "message-erreur");
    erreur.id = "erreur-modif";
    erreur.setAttribute("role", "alert");
    erreur.hidden = true;
    blocTitre.appendChild(erreur);
    formulaire.appendChild(blocTitre);

    const description = document.createElement("input");
    description.type = "text";
    description.id = "modif-description";
    description.autocomplete = "off";
    description.value = tache.description;
    formulaire.appendChild(Interface.creerChamp("champ champ-large", "Description", description));

    const priorite = Interface.creerListe("modif-priorite", Interface.LIBELLES_PRIORITE);
    priorite.value = tache.priority; // sélectionne la priorité actuelle
    formulaire.appendChild(Interface.creerChamp("champ", "Priorité", priorite));

    // Catégorie (story 10) : « Aucune » en premier, puis Cours, Perso, Projet
    const categorie = Interface.creerListe("modif-categorie", Interface.LIBELLES_CATEGORIE, "Aucune");
    categorie.value = tache.category; // sélectionne la catégorie actuelle ("" = Aucune)
    formulaire.appendChild(Interface.creerChamp("champ", "Catégorie", categorie));

    const echeance = document.createElement("input");
    echeance.type = "date";
    echeance.id = "modif-echeance";
    echeance.value = tache.dueDate;
    formulaire.appendChild(Interface.creerChamp("champ", "Échéance", echeance));

    const boutons = Interface.creerElement("div", "boutons-modification");
    const enregistrer = Interface.creerElement("button", "bouton bouton-principal", "Enregistrer");
    enregistrer.type = "submit";
    const annuler = Interface.creerElement("button", "bouton", "Annuler");
    annuler.type = "button";
    annuler.dataset.action = "annuler"; // traité par la délégation de clic, comme la corbeille
    boutons.appendChild(enregistrer);
    boutons.appendChild(annuler);
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
  afficherMessageVide: function (cas, motCle) {
    const message = document.getElementById("message-vide");
    message.hidden = cas === "";
    if (cas === "") {
      message.textContent = "";
    } else if (cas === "recherche") {
      // textContent : un mot-clé contenant du HTML s'affiche tel quel
      message.textContent = "Aucune tâche ne correspond à « " + motCle + " ».";
    } else {
      message.textContent = Interface.MESSAGES_VIDE[cas];
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

  // Demande confirmation avant une suppression (story 6).
  // confirm() est une fonction standard du navigateur : elle renvoie true (OK) ou false (Annuler).
  confirmerSuppression: function (titre) {
    return window.confirm("Supprimer la tâche « " + titre + " » ?");
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
    document.getElementById("ajout-titre").focus();
  },

  // Branche le formulaire d'ajout : traiter(donnees) est appelée à chaque envoi
  // (bouton « Ajouter » ou touche Entrée dans un champ).
  surAjout: function (traiter) {
    document.getElementById("formulaire-ajout").addEventListener("submit", function (evenement) {
      evenement.preventDefault(); // empêche le navigateur de recharger la page
      traiter(Interface.lireFormulaireAjout());
    });
    // L'erreur disparaît dès que l'utilisateur corrige le titre
    document.getElementById("ajout-titre").addEventListener("input", Interface.effacerErreurAjout);
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
    document.getElementById("compteur").textContent = nombre + " " + mot + " à faire";
  },
};
