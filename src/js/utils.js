/*
 * utils.js — objet Utils
 * Fonctions communes : générer un id, formater une date ISO en jj/mm/aaaa,
 * nettoyer une saisie.
 * Dépend de : rien.
 * Ne connaît ni les tâches ni l'écran.
 */
const Utils = {
  // Génère un identifiant unique : l'heure actuelle en millisecondes.
  // Hypothèse (voir README) : deux tâches ne sont jamais créées dans la même milliseconde.
  genererId: function () {
    return Date.now();
  },

  // Transforme "2026-11-15" en "15/11/2026". Renvoie "" si la date est vide.
  formaterDate: function (dateIso) {
    if (!dateIso) {
      return "";
    }
    const morceaux = dateIso.split("-"); // ["2026", "11", "15"]
    return morceaux[2] + "/" + morceaux[1] + "/" + morceaux[0];
  },

  // Date du jour au format ISO "YYYY-MM-DD", à l'heure locale.
  // On n'utilise pas toISOString() : elle donne la date en heure UTC,
  // ce qui peut décaler d'un jour autour de minuit.
  dateDuJour: function () {
    const maintenant = new Date();
    const annee = maintenant.getFullYear();
    const mois = String(maintenant.getMonth() + 1).padStart(2, "0"); // getMonth() commence à 0
    const jour = String(maintenant.getDate()).padStart(2, "0");
    return annee + "-" + mois + "-" + jour;
  },

  // Nettoie une saisie : la transforme en texte et retire les espaces au début et à la fin.
  nettoyerTexte: function (texte) {
    if (texte === undefined || texte === null) {
      return "";
    }
    return String(texte).trim();
  },
};
