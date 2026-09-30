/**
 * NYEGA - Dictionnaire de Mots-Clés Locaux & Résolution de Catégories
 * Cible : Étudiants togolais (Lomé, Kara, campus universitaires)
 *
 * Catégories strictes :
 * 1. Alimentation
 * 2. Transport
 * 3. Soins et beauté
 * 4. Connexion internet
 * 5. Crédit d'appel
 * 6. Plaisirs
 * 7. Autres
 */

(function(window) {
  'use strict';

  // Dictionnaire de termes togolais et de la vie étudiante
  const LOCAL_DICTIONARY = {
    'Transport': [
      'zem', 'zém', 'zemidjan', 'zémidjan', 'taxi', 'moto', 'mototaxi', 'bus',
      'campus', 'course', 'transport', 'carburant', 'essence', 'gasoil', 'station',
      'tricycle', 'olufemi', 'gbaka', 'adawlato', 'assigamé', 'baguida', 'agoè',
      'agoe', 'kelegougan', 'kélégougan', 'totsi', 'adidogome', 'adidogomé',
      'hedzranawoe', 'hedzranawoé', 'tokoin', 'amoutive', 'amoutivé', 'be', 'bè',
      'djidjole', 'djidjolé', 'gare', 'covoiturage', 'deplacement', 'déplacement',
      'ticket bus', 'trajet', 'aller retour'
    ],

    'Alimentation': [
      // Plats & mets togolais
      'pain', 'riz', 'pate', 'pâte', 'sauce', 'fufu', 'foufou', 'ayimolou', 'atassi',
      'kom', 'djenkoume', 'djenkoumé', 'ablo', 'gboma', 'ademe', 'adémè', 'folléré',
      'arachides', 'oeuf', 'oeufs', 'resto u', 'restou', 'crous', 'cantine',
      'sandwich', 'spaghetti', 'cafeteria', 'cafétéria', 'alloco', 'aloco', 'garba',
      'beignets', 'beignet', 'tchouk', 'tchoukoutou', 'avocat', 'salade', 'jus',
      'biscuit', 'biscuits', 'viande', 'poisson', 'agban', 'dekou', 'dékou', 'dessi',
      'dési', 'dékou dessi', 'akpan', 'vegyi', 'yovo doko', 'pastel', 'pastels',
      'mangue', 'banane', 'fruit', 'fruits', 'repas', 'diner', 'dîner', 'dejeuner',
      'déjeuner', 'petit dej', 'petit dejeuner', 'croissant', 'nourriture', 'manger',
      'brochette', 'brochettes', 'poulet', 'poisson braise', 'poisson braisé',
      'haricot', 'gari', 'manioc', 'igname', 'igname pilee', 'igname pilée',
      'sauce arachide', 'sauce graine', 'supermarche', 'supermarché', 'marche', 'marché'
    ],

    'Soins et beauté': [
      'gloss', 'tresses', 'tresse', 'meches', 'mèches', 'savon', 'parfum',
      'coiffure', 'coiffeur', 'defrisage', 'défrisage', 'maquillage', 'creme', 'crème',
      'pommade', 'gel douche', 'gel', 'serviette', 'serviettes', 'serviette hygienique',
      'hygienique', 'coupe', 'barbier', 'salon de coiffure', 'cheveux', 'perruque',
      'ongles', 'ongle', 'manucure', 'pedicure', 'pédicure', 'dentifrice', 'brosse a dents',
      'rasoir', 'lait de corps', 'baume', 'coton', 'shampoing', 'deodorant', 'déodorant',
      'skincare', 'lotion', 'tisane', 'medicament', 'médicament', 'pharmacie', 'pansement',
      'mousse', 'tissage', 'soin visage', 'beaute', 'beauté'
    ],

    'Connexion internet': [
      'forfait internet', 'forfait data', 'connexion', 'pass internet', 'pass', 'data', 'mega', 'méga', 'giga',
      'wifi', 'wi-fi', 'cyber', 'cybercafe', 'cybercafé', 'togocom data', 'moov data',
      'fibre', 'recharge net', 'pass nuit', 'pass semaine', 'pass mois', 'modem', 'box',
      'internet', 'megas', 'gigas', 'bundle', 'recharge internet', 'souscription'
    ],

    'Crédit d\'appel': [
      'credit', 'crédit', 'retransmission', 'transfert', 'appel', 'appels',
      'credit dappel', 'crédit d\'appel', 'credit appel', 'togocom credit', 'moov credit',
      'recharge credit', 'recharge appel', 'unite', 'unité', 'unites', 'unités', 'minute',
      'minutes', 'communication', 'carte de recharge', 'flash credit'
    ],

    'Plaisirs': [
      'maquis', 'sortie', 'cine', 'ciné', 'cinema', 'cinéma', 'biere', 'bière',
      'castel', 'guinness', 'pils', 'chill', 'soiree', 'soirée', 'bar', 'fete', 'fête',
      'plage', 'plage de lome', 'piscine', 'chicha', 'concert', 'loisir', 'loisirs',
      'jeu', 'jeux', 'ps5', 'ps4', 'gaming', 'playstation', 'streaming', 'netflix',
      'spotify', 'glace', 'snack', 'anniversaire', 'resto chic', 'detente', 'détente',
      'show', 'boite de nuit', 'boîte', 'club', 'night club', 'aperitif', 'apéro'
    ],

    'Autres': [
      'photocopie', 'photocopies', 'impression', 'imprimerie', 'fourniture',
      'fournitures', 'cahier', 'stylo', 'livre', 'polycope', 'polycopié', 'syllabus',
      'frais bancaire', 'retrait', 'banque', 'loyer', 'caution', 'eau', 'electricite',
      'électricité', 'cashpower', 'tde', 'reparation', 'réparation', 'don', 'aide'
    ]
  };

  /**
   * Normalise une chaîne : suppression des accents, ponctuation, minuscules
   */
  function normalizeText(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // supprime les diacritiques
      .replace(/[^a-z0-9\s]/g, ' ')   // remplace la ponctuation par des espaces
      .replace(/\s+/g, ' ')            // fusionne les espaces
      .trim();
  }

  /**
   * Résolution locale en 2 étapes :
   * 1. Mémoire utilisateur (category_rules)
   * 2. Dictionnaire de mots-clés togolais
   */
  function resolveCategoryLocal(description, userRules = []) {
    if (!description) return null;
    const cleanDesc = normalizeText(description);
    if (!cleanDesc) return null;

    const words = cleanDesc.split(' ');

    // ÉTAPE 1 : Mémoire utilisateur (category_rules)
    // Cherche d'abord une correspondance avec les corrections passées de l'utilisateur
    if (Array.isArray(userRules) && userRules.length > 0) {
      for (const rule of userRules) {
        const cleanRuleKw = normalizeText(rule.keyword);
        if (!cleanRuleKw) continue;

        // Match exact de sous-chaîne ou de mot
        if (cleanDesc === cleanRuleKw || cleanDesc.includes(cleanRuleKw)) {
          return {
            category: rule.category_name,
            matchedKeyword: rule.keyword,
            source: 'user_rule',
            confidence: 1.0
          };
        }
      }
    }

    // ÉTAPE 2 : Dictionnaire local togolais
    // Priorité aux expressions multi-mots (ex: "pass nuit", "resto u", "credit appel")
    for (const [category, keywords] of Object.entries(LOCAL_DICTIONARY)) {
      for (const kw of keywords) {
        const cleanKw = normalizeText(kw);
        // Si mot composé (ex: "resto u", "pass internet")
        if (cleanKw.includes(' ')) {
          if (cleanDesc.includes(cleanKw)) {
            return {
              category,
              matchedKeyword: kw,
              source: 'local_dict',
              confidence: 0.95
            };
          }
        }
      }
    }

    // Recherche de mots simples
    for (const word of words) {
      if (word.length < 2) continue; // ignorer les lettres isolées
      for (const [category, keywords] of Object.entries(LOCAL_DICTIONARY)) {
        for (const kw of keywords) {
          const cleanKw = normalizeText(kw);
          if (cleanKw === word) {
            return {
              category,
              matchedKeyword: kw,
              source: 'local_dict',
              confidence: 0.90
            };
          }
        }
      }
    }

    // Rien trouvé localement -> Doit passer à l'étape 3 (IA Edge Function)
    return null;
  }

  window.LOCAL_DICTIONARY = LOCAL_DICTIONARY;
  window.normalizeText = normalizeText;
  window.resolveCategoryLocal = resolveCategoryLocal;

})(window);
