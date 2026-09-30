/**
 * TEST SUITE : Extraction du mot-clé significatif (Phrases togolaises réalistes)
 * 15 tests unitaires vérifiant que l'algorithme privilégie :
 * 1. Les termes du dictionnaire togolais (expressions composées puis mots simples)
 * 2. Les noms (objets réels de dépense) plutôt que les adjectifs ou la longueur
 */

const {
  normalizeText,
  LOCAL_DICTIONARY,
  extractMainKeyword,
  FRENCH_STOP_WORDS,
  FRENCH_ADJECTIVES
} = require('../nyega-web/js/local-dictionary.js');

// 15 PHRASES TOGOLAISES RÉALISTES
const TEST_CASES = [
  {
    id: 1,
    phrase: "zem pour aller à la fac",
    expected: "zem",
    category: "Transport",
    note: "Terme dictionnaire Transport"
  },
  {
    id: 2,
    phrase: "pâte et sauce au resto",
    expected: "pate",
    category: "Alimentation",
    note: "Premier mets d'alimentation du dictionnaire"
  },
  {
    id: 3,
    phrase: "gloss et lait de corps",
    expected: "lait de corps", // ou gloss si priorité simple, mais multi-mot "lait de corps" est plus précis
    category: "Soins et beauté",
    note: "Expression composée du dictionnaire (beauté)"
  },
  {
    id: 4,
    phrase: "ayimolou avec poisson au campus",
    expected: "ayimolou",
    category: "Alimentation",
    note: "Plat togolais emblématique du dictionnaire"
  },
  {
    id: 5,
    phrase: "pass internet 1000 pour la semaine",
    expected: "pass internet",
    category: "Connexion internet",
    note: "Expression composée du dictionnaire (internet)"
  },
  {
    id: 6,
    phrase: "credit appel moov pour maman",
    expected: "credit appel",
    category: "Crédit d'appel",
    note: "Expression composée du dictionnaire (appel)"
  },
  {
    id: 7,
    phrase: "bière et brochettes au maquis",
    expected: "biere",
    category: "Plaisirs",
    note: "Premier élément de plaisir du dictionnaire"
  },
  {
    id: 8,
    phrase: "taxi pour aller au grand marché",
    expected: "taxi",
    category: "Transport",
    note: "Moyen de transport, 'grand' est un adjectif filtré"
  },
  {
    id: 9,
    phrase: "tresse et mèches pour la fête",
    expected: "tresse",
    category: "Soins et beauté",
    note: "Soin de beauté, premier terme du dictionnaire"
  },
  {
    id: 10,
    phrase: "recharge togocom data pour le projet",
    expected: "togocom data",
    category: "Connexion internet",
    note: "Expression composée du dictionnaire"
  },
  {
    id: 11,
    phrase: "petit déjeuner pain et omelette",
    expected: "petit dejeuner",
    category: "Alimentation",
    note: "Expression composée du dictionnaire"
  },
  {
    id: 12,
    phrase: "photocopies des cours d'anglais",
    expected: "photocopies",
    category: "Autres",
    note: "Fourniture étudiante du dictionnaire"
  },
  {
    id: 13,
    phrase: "superbe chemise pour la soutenance",
    expected: "chemise",
    category: "Hors dictionnaire",
    note: "Nom réel retenu, et NON l'adjectif 'superbe' ou longueur"
  },
  {
    id: 14,
    phrase: "magnifique robe pour ma soeur",
    expected: "robe",
    category: "Hors dictionnaire",
    note: "Nom 'robe' (4 lettres) préféré à l'adjectif 'magnifique' (10 lettres)"
  },
  {
    id: 15,
    phrase: "fufu sauce graine à midi",
    expected: "sauce graine", // expression composée ou fufu
    category: "Alimentation",
    note: "Expression dictionnaire ou mets togolais"
  }
];

function runTests() {
  console.log("================================================================================");
  console.log("TESTS UNITAIRES (15) : EXTRACTION DU MOT-CLÉ SIGNIFICATIF (TOGO)");
  console.log("================================================================================\n");

  let passed = 0;
  TEST_CASES.forEach((tc) => {
    const result = extractMainKeyword(tc.phrase);
    // Cas équivalents acceptés si dictionnaire comporte plusieurs termes valides
    const isSuccess = (result === tc.expected) ||
                      (tc.id === 3 && (result === "gloss" || result === "lait de corps")) ||
                      (tc.id === 15 && (result === "fufu" || result === "sauce graine"));

    if (isSuccess) {
      passed++;
      console.log(`[PASS] Test #${tc.id.toString().padStart(2, '0')} : "${tc.phrase}"`);
      console.log(`       Mot-clé retenu : "${result}" (${tc.note})\n`);
    } else {
      console.log(`[FAIL] Test #${tc.id.toString().padStart(2, '0')} : "${tc.phrase}"`);
      console.log(`       Attendu : "${tc.expected}", Obtenu : "${result}"\n`);
    }
  });

  console.log("--------------------------------------------------------------------------------");
  console.log(`RÉSULTAT GLOBAL : ${passed}/${TEST_CASES.length} tests réussis (${Math.round((passed / TEST_CASES.length) * 100)}%)`);
  console.log("================================================================================");

  if (passed !== TEST_CASES.length) {
    process.exit(1);
  }
}

// Export pour utilisation dans app.js ou tests externes
module.exports = {
  extractMainKeyword,
  FRENCH_STOP_WORDS,
  FRENCH_ADJECTIVES,
  TEST_CASES
};

if (require.main === module) {
  runTests();
}
