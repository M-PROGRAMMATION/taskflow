/*
 * storage.js — objet Stockage
 * Lecture / écriture JSON dans localStorage (clés taskflow_taches, taskflow_utilisateurs).
 * Renvoie une valeur par défaut si la donnée est absente ou corrompue (try/catch).
 * Dépend de : rien.
 * Seul fichier qui accède à localStorage. Pas de règle métier ici.
 */
const Stockage = {};
