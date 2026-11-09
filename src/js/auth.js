/*
 * auth.js — objet Auth (Cybersécurité, sprint 3)
 * Règles du mot de passe (8 caractères, majuscule, chiffre, caractère spécial),
 * hachage SHA-256, création du compte de test.
 * Dépend de : Utils.
 * Pas d'accès au DOM ni à localStorage : les fonctions reçoivent la liste des comptes
 * et renvoient une nouvelle liste, c'est app.js qui la sauvegarde.
 */
const Auth = {
  // Identifiant du compte de test, imposé (décision du binôme, story 12)
  IDENTIFIANT_TEST: "test",
  LONGUEUR_MIN: 8,

  // Les 4 règles de la story 13. Chaque règle a un test et le texte affiché quand elle manque.
  REGLES: [
    {
      // Array.from compte les caractères un par un (un emoji compte pour 1, pas pour 2)
      test: function (motDePasse) {
        return Array.from(motDePasse).length >= Auth.LONGUEUR_MIN;
      },
      manque: "au moins 8 caractères",
    },
    {
      test: function (motDePasse) {
        return /[A-Z]/.test(motDePasse); // A à Z, sans accent (story 13)
      },
      manque: "une majuscule",
    },
    {
      test: function (motDePasse) {
        return /\d/.test(motDePasse); // \d = un chiffre de 0 à 9
      },
      manque: "un chiffre",
    },
    {
      // Caractère spécial : ni une lettre ni un chiffre, dans n'importe quelle langue.
      // \p{L} = toute lettre (é, è, à compris), \p{N} = tout chiffre. Le u final active \p{...}.
      // Donc « ! », « ? », « # » ou un espace comptent, mais pas « é ».
      test: function (motDePasse) {
        return /[^\p{L}\p{N}]/u.test(motDePasse);
      },
      manque: "un caractère spécial",
    },
  ],

  // Renvoie la liste des textes des règles qui ne sont pas respectées
  // (tableau vide si le mot de passe respecte les 4 règles).
  reglesManquantes: function (motDePasse) {
    return Auth.REGLES.filter(function (regle) {
      return !regle.test(motDePasse);
    }).map(function (regle) {
      return regle.manque;
    });
  },

  // Story 13 : contrôle de robustesse, au moment où le mot de passe est choisi.
  // Renvoie { valide: true } ou { valide: false, message: "Il manque : une majuscule, un chiffre." }.
  // Le mot de passe n'est pas nettoyé (trim) : un espace est un caractère spécial.
  verifierRobustesse: function (motDePasse) {
    const manquantes = Auth.reglesManquantes(motDePasse);
    if (manquantes.length > 0) {
      return { valide: false, message: "Il manque : " + manquantes.join(", ") + "." };
    }
    return { valide: true };
  },

  // Vérifie le formulaire du premier lancement : mot de passe et confirmation (story 12).
  validerCreation: function (motDePasse, confirmation) {
    if (motDePasse === "") {
      return { valide: false, message: "Choisissez un mot de passe." };
    }
    const robustesse = Auth.verifierRobustesse(motDePasse);
    if (!robustesse.valide) {
      return robustesse;
    }
    if (motDePasse !== confirmation) {
      return { valide: false, message: "Les deux mots de passe ne sont pas identiques." };
    }
    return { valide: true };
  },

  // ---------- Hachage (story 15) ----------

  // Indique si le navigateur sait hacher avec l'API native crypto.subtle.
  // Sans elle, on refuse de créer le compte : jamais de mot de passe en clair à la place.
  hachageDisponible: function () {
    // typeof : ne plante pas si crypto n'existe pas du tout dans ce navigateur
    return typeof crypto !== "undefined" && crypto.subtle !== undefined;
  },

  // Hache un mot de passe en SHA-256 et renvoie une promesse de l'empreinte
  // en 64 caractères hexadécimaux (ex. "9f86d0...").
  // crypto.subtle.digest est asynchrone : on utilise async / await.
  hacher: async function (motDePasse) {
    const octets = new TextEncoder().encode(motDePasse); // texte → octets (UTF-8)
    const tampon = await crypto.subtle.digest("SHA-256", octets); // 32 octets
    // Chaque octet (0 à 255) devient 2 caractères hexadécimaux : 10 → "0a"
    return Array.from(new Uint8Array(tampon))
      .map(function (octet) {
        return octet.toString(16).padStart(2, "0");
      })
      .join("");
  },

  // ---------- Comptes ----------

  // Garde seulement les comptes lisibles d'une liste venue du stockage
  // (même principe que Taches.nettoyerListe). Renvoie une nouvelle liste.
  nettoyerUtilisateurs: function (liste) {
    const valides = liste.filter(function (compte) {
      return (
        compte !== null &&
        typeof compte === "object" &&
        typeof compte.username === "string" &&
        compte.username !== "" &&
        typeof compte.passwordHash === "string" &&
        /^[0-9a-f]{64}$/.test(compte.passwordHash)
      );
    });
    return valides.map(function (compte) {
      return {
        username: compte.username,
        passwordHash: compte.passwordHash,
        failedAttempts: Number.isInteger(compte.failedAttempts) ? compte.failedAttempts : 0,
        lockedUntil: typeof compte.lockedUntil === "number" ? compte.lockedUntil : 0,
      };
    });
  },

  // Retrouve un compte par son identifiant. Renvoie undefined s'il n'existe pas.
  trouver: function (utilisateurs, identifiant) {
    return utilisateurs.find(function (compte) {
      return compte.username === identifiant;
    });
  },

  // Ajoute un compte et renvoie une NOUVELLE liste. Seule l'empreinte est enregistrée.
  creerUtilisateur: function (utilisateurs, identifiant, empreinte) {
    const compte = {
      username: identifiant,
      passwordHash: empreinte,
      failedAttempts: 0,
      lockedUntil: 0,
    };
    return utilisateurs.concat([compte]);
  },
};
