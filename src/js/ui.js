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

  // Réaffiche toute la liste.
  // echeances : objet { id: "late" | "today" | "" } préparé par app.js.
  afficherTaches: function (taches, echeances) {
    const liste = document.getElementById("liste-taches");
    liste.textContent = ""; // vide la liste avant de la reconstruire

    // Message affiché seulement quand il n'existe aucune tâche
    document.getElementById("message-vide").hidden = taches.length > 0;

    taches.forEach(function (tache) {
      liste.appendChild(Interface.creerLigneTache(tache, echeances[tache.id]));
    });
  },

  // ---------- Formulaire d'ajout (story 1) ----------

  // Lit les valeurs du formulaire d'ajout, telles que saisies (Taches les vérifie).
  lireFormulaireAjout: function () {
    return {
      title: document.getElementById("ajout-titre").value,
      description: document.getElementById("ajout-description").value,
      priority: document.getElementById("ajout-priorite").value,
      dueDate: document.getElementById("ajout-echeance").value,
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

  // Vide le formulaire (la priorité revient sur « Moyenne ») et remet le curseur dans le titre.
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

  // Affiche « 3 tâches à faire », « 1 tâche à faire » ou « 0 tâche à faire »
  // (en français, 0 et 1 sont au singulier).
  afficherCompteur: function (nombre) {
    const mot = nombre <= 1 ? "tâche" : "tâches";
    document.getElementById("compteur").textContent = nombre + " " + mot + " à faire";
  },
};
