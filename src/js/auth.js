/*
 * auth.js — objet Auth (Cybersécurité, sprint 3)
 * Règles du mot de passe (8 caractères, majuscule, chiffre, caractère spécial),
 * niveau de la jauge (faible / moyen / fort), hachage SHA-256, création du compte de test,
 * vérification de la connexion, blocage après 3 échecs.
 * Dépend de : Utils.
 * Pas d'accès au DOM ni à localStorage : les fonctions reçoivent la liste des comptes
 * et renvoient une nouvelle liste, c'est app.js qui la sauvegarde.
 */
const Auth = {
  // Identifiant du compte de test, imposé (décision du binôme, story 12)
  IDENTIFIANT_TEST: "test",
  LONGUEUR_MIN: 8,
  MAX_ECHECS: 3, // échecs de suite avant le blocage (story 16)
  DUREE_BLOCAGE: 20000, // 20 secondes, en millisecondes (décision du binôme)
  MESSAGE_INCORRECT: "Identifiant ou mot de passe incorrect.",

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

  // Pour chacune des 4 règles, dans l'ordre de REGLES : true si elle est respectée.
  // Sert à cocher les règles une par une sous le champ (ex. [true, true, false, false]).
  reglesRespectees: function (motDePasse) {
    return Auth.REGLES.map(function (regle) {
      return regle.test(motDePasse);
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

  // Story 14 : niveau de la jauge, selon le nombre de règles respectées parmi les 4.
  //   ""       : champ vide (jauge vide, aucun mot)
  //   "weak"   : 0 à 2 règles  → Faible
  //   "medium" : 3 règles      → Moyen
  //   "strong" : les 4 règles  → Fort, le seul niveau qui permet de créer le compte.
  // Calculé à partir de reglesManquantes : la jauge et la story 13 ne peuvent pas se contredire.
  niveauRobustesse: function (motDePasse) {
    if (motDePasse === "") {
      return "";
    }
    const respectees = Auth.REGLES.length - Auth.reglesManquantes(motDePasse).length;
    if (respectees === 4) {
      return "strong";
    }
    if (respectees === 3) {
      return "medium";
    }
    return "weak";
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

  // Même vérification, sous forme de résultat de validation, pour qu'Interface affiche le message.
  verifierHachage: function () {
    if (!Auth.hachageDisponible()) {
      return {
        valide: false,
        message: "Ce navigateur ne sait pas hacher le mot de passe (crypto.subtle) : impossible de continuer.",
      };
    }
    return { valide: true };
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

  // ---------- Connexion (story 12) ----------

  // Vérifie que les deux champs de l'écran de connexion sont remplis.
  // L'identifiant est nettoyé (espaces retirés), pas le mot de passe.
  validerConnexion: function (identifiant, motDePasse) {
    if (Utils.nettoyerTexte(identifiant) === "" || motDePasse === "") {
      return { valide: false, message: "Saisissez votre identifiant et votre mot de passe." };
    }
    return { valide: true };
  },

  // Message affiché pendant un blocage. resteMs : temps restant en millisecondes.
  // Math.ceil arrondit au-dessus : 19,2 secondes restantes s'affichent « 20 secondes ».
  messageBlocage: function (resteMs) {
    const secondes = Math.ceil(resteMs / 1000);
    const unite = secondes > 1 ? "secondes" : "seconde";
    return "Compte bloqué. Réessayez dans " + secondes + " " + unite + ".";
  },

  // Remplace un compte (même identifiant) dans la liste. Renvoie une NOUVELLE liste.
  remplacer: function (utilisateurs, compteModifie) {
    return utilisateurs.map(function (compte) {
      return compte.username === compteModifie.username ? compteModifie : compte;
    });
  },

  // Vérifie une connexion (stories 12 et 16).
  //   empreinte  : le mot de passe saisi, déjà haché par Auth.hacher
  //   maintenant : l'heure actuelle en millisecondes (Date.now()), donnée par app.js :
  //                la fonction reste pure et se teste avec n'importe quelle heure.
  // Renvoie { reussi, message, identifiant, utilisateurs, bloque, resteMs }, où utilisateurs
  // est la NOUVELLE liste des comptes (compteur d'échecs, blocage), à sauvegarder par app.js.
  // bloque vaut true si le compte est bloqué ; resteMs est alors le temps restant en millisecondes.
  connecter: function (utilisateurs, identifiant, empreinte, maintenant) {
    const trouve = Auth.trouver(utilisateurs, Utils.nettoyerTexte(identifiant));
    if (trouve === undefined) {
      // Identifiant inconnu : même message qu'un mauvais mot de passe, pour ne pas
      // révéler quels comptes existent. Pas d'échec compté : il n'y a pas de compte à bloquer.
      return { reussi: false, message: Auth.MESSAGE_INCORRECT, utilisateurs: utilisateurs };
    }
    const compte = { ...trouve }; // copie : la liste reçue n'est pas modifiée

    // Blocage terminé : il se lève tout seul et le compteur repart de 0
    if (compte.lockedUntil !== 0 && compte.lockedUntil <= maintenant) {
      compte.failedAttempts = 0;
      compte.lockedUntil = 0;
    }

    // Compte encore bloqué : refusé, même avec le bon mot de passe
    if (compte.lockedUntil > maintenant) {
      return {
        reussi: false,
        message: Auth.messageBlocage(compte.lockedUntil - maintenant),
        utilisateurs: Auth.remplacer(utilisateurs, compte),
        bloque: true,
        resteMs: compte.lockedUntil - maintenant,
      };
    }

    // Mauvais mot de passe : un échec de plus ; au 3e de suite, le compte est bloqué
    if (compte.passwordHash !== empreinte) {
      compte.failedAttempts = compte.failedAttempts + 1;
      if (compte.failedAttempts >= Auth.MAX_ECHECS) {
        compte.lockedUntil = maintenant + Auth.DUREE_BLOCAGE; // heure de fin, enregistrée
        return {
          reussi: false,
          message: Auth.messageBlocage(Auth.DUREE_BLOCAGE),
          utilisateurs: Auth.remplacer(utilisateurs, compte),
          bloque: true,
          resteMs: Auth.DUREE_BLOCAGE,
        };
      }
      return {
        reussi: false,
        message: Auth.MESSAGE_INCORRECT,
        utilisateurs: Auth.remplacer(utilisateurs, compte),
      };
    }

    // Connexion réussie : le compteur d'échecs repart de 0
    compte.failedAttempts = 0;
    compte.lockedUntil = 0;
    return {
      reussi: true,
      identifiant: compte.username,
      utilisateurs: Auth.remplacer(utilisateurs, compte),
    };
  },
};
