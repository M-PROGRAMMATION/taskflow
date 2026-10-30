/*
 * ui.js — objet Interface
 * Tout l'accès au DOM : afficher la liste, lire le formulaire, afficher les erreurs,
 * la jauge, basculer entre les écrans.
 * Toujours textContent / createElement, jamais innerHTML (XSS).
 * Dépend de : Utils.
 * Pas de règle métier ici.
 */
const Interface = {};
