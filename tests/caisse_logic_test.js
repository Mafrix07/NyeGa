/**
 * TESTS UNITAIRES AUTOMATISÉS : Logique Caisse, Périodes & Sécurité CSV
 * Valide les comportements requis par PT3 sans nécessiter d'appel réseau.
 */

const assert = require('assert');

// 1. Protection anti-CSV Injection (CWE-1236)
function sanitizeCSVField(val) {
  let str = String(val == null ? '' : val);
  if (/^\s*[=+\-@\t\r]/.test(str)) {
    str = "'" + str;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

// 2. Calcul du dépensé restreint à la période active
function calculateSpentForActiveBudget(expenses, periodStart, periodEnd) {
  return expenses.reduce((sum, exp) => {
    const d = exp.expense_date;
    if (d && (!periodStart || d >= periodStart) && (!periodEnd || d <= periodEnd)) {
      return sum + Math.round(parseFloat(exp.amount || 0));
    }
    return sum;
  }, 0);
}

// 3. Proposition de date J+1 pour "Même budget, nouvelle période"
function proposeNextPeriod(prevPeriodEndStr) {
  const parts = String(prevPeriodEndStr || '').split('-').map(Number);
  const prevEndUtc = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
  prevEndUtc.setUTCDate(prevEndUtc.getUTCDate() + 1);
  const nextStartStr = prevEndUtc.toISOString().split('T')[0];

  const nextEndUtc = new Date(Date.UTC(prevEndUtc.getUTCFullYear(), prevEndUtc.getUTCMonth() + 1, 0));
  const nextEndStr = nextEndUtc.toISOString().split('T')[0];

  return { nextStartStr, nextEndStr };
}

// 4. Notification consolidée des budgets expirés
function formatClosedBudgetsNotification(closedRows) {
  let totalLeftover = 0;
  let totalOverspend = 0;
  closedRows.forEach(r => {
    totalLeftover += (Number(r.leftover_amount) || 0);
    totalOverspend += (Number(r.overspend_amount) || 0);
  });

  if (totalLeftover > 0) {
    return { type: 'leftover', amount: totalLeftover, text: `Ta période est terminée. Il te restait ${totalLeftover} FCFA, ajoutés à ta caisse.` };
  } else if (totalOverspend > 0) {
    return { type: 'overspend', amount: totalOverspend, text: `Ta période est terminée avec un dépassement de ${totalOverspend} FCFA. C'est l'occasion de repartir du bon pied pour ta prochaine période !` };
  } else {
    return { type: 'balanced', amount: 0, text: `Ta période est terminée. Ton budget a été parfaitement respecté !` };
  }
}

// 5. Traduction d'erreurs en français
function mapBudgetError(error) {
  if (!error) return "Une erreur est survenue lors de l'enregistrement du budget.";
  const msg = ((error.message || '') + ' ' + (error.details || '') + ' ' + (error.hint || '')).toLowerCase();

  if (error.code === '23505' || msg.includes('budgets_one_active_per_user') || msg.includes('déjà actif') || msg.includes('deja actif')) {
    return 'Un budget est déjà actif.';
  }
  if (error.code === '23P01' || error.code === '23p01' || msg.includes('excl_budgets_no_overlap') || msg.includes('overlap') || msg.includes('chevauche')) {
    return 'Cette période chevauche un budget existant.';
  }
  if (msg.includes('chk_budgets_period_order') || msg.includes('period_order')) {
    return 'La date de fin ne peut pas être antérieure à la date de début.';
  }
  if (msg.includes('chk_budgets_monthly_amount_positive') || msg.includes('monthly_amount_positive')) {
    return 'Le montant du budget doit être supérieur à 0 FCFA.';
  }
  if (msg.includes('cette période est terminée') || msg.includes('période du budget est déjà terminée') || msg.includes('periode du budget est deja terminee') || msg.includes('déjà terminée') || msg.includes('deja terminee')) {
    return 'La période du budget est déjà terminée.';
  }
  if (msg.includes('date de fin ne peut pas être dans le passé') || msg.includes('dans le passe') || msg.includes('dans le passé')) {
    return 'La date de fin ne peut pas être dans le passé.';
  }
  return error.message || "Erreur lors de l'enregistrement du budget.";
}

// SUITE DE TESTS
console.log("================================================================================");
console.log("TESTS AUTOMATISÉS : LOGIQUE CAISSE, PÉRIODES & CSV (PT3)");
console.log("================================================================================\n");

// Test 1 : CSV Sanitization
assert.strictEqual(sanitizeCSVField('=cmd|/C calc'), "\"'=cmd|/C calc\"");
assert.strictEqual(sanitizeCSVField('+123'), "\"'+123\"");
assert.strictEqual(sanitizeCSVField('-456'), "\"'-456\"");
assert.strictEqual(sanitizeCSVField('@SUM(A1:A5)'), "\"'@SUM(A1:A5)\"");
assert.strictEqual(sanitizeCSVField('   =FORMULE'), "\"'   =FORMULE\"");
assert.strictEqual(sanitizeCSVField('Texte normal'), "\"Texte normal\"");
console.log("✅ [PASS] 1. Neutralisation injection CSV (CWE-1236)");

// Test 2 : Calcul des dépenses restreint à la période active
const mockExpenses = [
  { amount: 500, expense_date: '2026-09-28' }, // Avant période
  { amount: 1500, expense_date: '2026-10-01' }, // Dans période
  { amount: 2000, expense_date: '2026-10-15' }, // Dans période
  { amount: 800, expense_date: '2026-10-31' }, // Dans période
  { amount: 4000, expense_date: '2026-11-02' }  // Après période
];
const spent = calculateSpentForActiveBudget(mockExpenses, '2026-10-01', '2026-10-31');
assert.strictEqual(spent, 4300); // 1500 + 2000 + 800 = 4300
console.log("✅ [PASS] 2. Dépenses d'accueil filtrées strictement sur [period_start, period_end]");

// Test 3 : Proposition de la date J+1
const nextPeriod = proposeNextPeriod('2026-09-30');
assert.strictEqual(nextPeriod.nextStartStr, '2026-10-01');
assert.strictEqual(nextPeriod.nextEndStr, '2026-10-31');
console.log("✅ [PASS] 3. Proposition J+1 pour 'Même budget, nouvelle période'");

// Test 4 : Notification consolidée des budgets clôturés
const leftoverNotif = formatClosedBudgetsNotification([{ leftover_amount: 12000, overspend_amount: 0 }]);
assert.strictEqual(leftoverNotif.type, 'leftover');
assert.strictEqual(leftoverNotif.amount, 12000);

const overspendNotif = formatClosedBudgetsNotification([{ leftover_amount: 0, overspend_amount: 3500 }]);
assert.strictEqual(overspendNotif.type, 'overspend');
assert.strictEqual(overspendNotif.amount, 3500);

// Multi-périodes consolidées
const multiNotif = formatClosedBudgetsNotification([
  { leftover_amount: 5000, overspend_amount: 0 },
  { leftover_amount: 7000, overspend_amount: 0 }
]);
assert.strictEqual(multiNotif.type, 'leftover');
assert.strictEqual(multiNotif.amount, 12000);
console.log("✅ [PASS] 4. Messages bienveillants et consolidation multi-budgets expirés");

// Test 5 : Traduction des erreurs SQL en français
assert.strictEqual(mapBudgetError({ code: '23505', message: 'budgets_one_active_per_user' }), 'Un budget est déjà actif.');
assert.strictEqual(mapBudgetError({ code: '23P01', message: 'excl_budgets_no_overlap' }), 'Cette période chevauche un budget existant.');
assert.strictEqual(mapBudgetError({ message: 'chk_budgets_period_order' }), 'La date de fin ne peut pas être antérieure à la date de début.');
assert.strictEqual(mapBudgetError({ message: 'chk_budgets_monthly_amount_positive' }), 'Le montant du budget doit être supérieur à 0 FCFA.');
assert.strictEqual(mapBudgetError({ message: 'date de fin ne peut pas être dans le passé' }), 'La date de fin ne peut pas être dans le passé.');
console.log("✅ [PASS] 5. Mappage et traduction française des erreurs SQL");

console.log("\n================================================================================");
console.log("TOUS LES TESTS AUTOMATISÉS DE LA LOGIQUE CAISSE SONT VALIDES (5/5) !");
console.log("================================================================================\n");
