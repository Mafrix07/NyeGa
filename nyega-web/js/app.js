/**
 * NYEGA WEB APPLICATION - Main Controller
 * Cible : Étudiants togolais (Lomé, Kara...) — Devise : FCFA
 * Intègre la catégorisation automatique en 4 étapes et la correction en 1 tap
 */

(function(window) {
  'use strict';

  // État global de l'application
  const state = {
    user: null,
    categories: [],
    budget: null,
    closedBudgets: null,
    lastClosedBudget: null,
    expenses: [],
    userRules: [],
    currentFormCategory: null,
    pickerTarget: null, // 'form' ou expenseId pour modification directe en 1 tap
    chartInstance: null,
    autoCatDebounceTimer: null,
    expensesLoadError: null
  };

  // Suivi de l'activité de l'onglet pour rappel de close_expired_budgets (> 1 heure)
  let lastTabActiveTime = Date.now();

  async function checkAndCloseExpiredBudgets() {
    try {
      if (!NyegaDB.isLive()) return;
      const closedRows = await NyegaDB.closeExpiredBudgets();
      if (closedRows && closedRows.length > 0) {
        handleClosedBudgetsNotification(closedRows);
        // Actualisation du budget actif et des budgets clôturés
        state.budget = await NyegaDB.getBudget();
        state.closedBudgets = await NyegaDB.getClosedBudgets();
        state.lastClosedBudget = (state.closedBudgets && state.closedBudgets[0]) || null;
        renderDashboard();
        initBudgetForm();
        renderHistoryClosedBudgets();
        renderCaisseCard();
      }
    } catch (e) {
      console.warn('Erreur non bloquante close_expired_budgets:', e.message || e);
    }
  }

  function handleClosedBudgetsNotification(closedRows) {
    let totalLeftover = 0;
    let totalOverspend = 0;
    closedRows.forEach(r => {
      totalLeftover += (Number(r.leftover_amount) || 0);
      totalOverspend += (Number(r.overspend_amount) || 0);
    });

    if (totalLeftover > 0) {
      showToast(`Ta période est terminée. Il te restait ${formatFCFA(totalLeftover)}, ajoutés à ta caisse.`, 6000);
    } else if (totalOverspend > 0) {
      showToast(`Ta période est terminée avec un dépassement de ${formatFCFA(totalOverspend)}. C'est l'occasion de repartir du bon pied pour ta prochaine période !`, 6000);
    } else {
      showToast(`Ta période est terminée. Ton budget a été parfaitement respecté !`, 6000);
    }
  }

  // ==========================================================
  // INITIALISATION
  // ==========================================================
  document.addEventListener('DOMContentLoaded', async function() {
    await initApp();

    window.addEventListener('hashchange', function() {
      if (!state.budget && (window.location.hash === '#accueil' || !window.location.hash)) {
        window.location.hash = '#budget';
        navigateToScreen('budget', false);
        openInitialBudgetModal();
        return;
      }
      handleHashNavigation();
    });

    // Surveillance de l'inactivité de l'onglet (> 1 heure)
    document.addEventListener('visibilitychange', async function() {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        const elapsed = now - lastTabActiveTime;
        const ONE_HOUR_MS = 60 * 60 * 1000;
        lastTabActiveTime = now;
        if (elapsed > ONE_HOUR_MS) {
          await checkAndCloseExpiredBudgets();
        }
      } else {
        lastTabActiveTime = Date.now();
      }
    });

    // Effacement de l'erreur sur date lors de la saisie
    const expDateInput = document.getElementById('expenseDate');
    if (expDateInput) {
      expDateInput.addEventListener('input', function() {
        const dateErrorEl = document.getElementById('expenseDateError');
        if (dateErrorEl) {
          dateErrorEl.classList.add('d-none');
          dateErrorEl.style.display = 'none';
          dateErrorEl.textContent = '';
        }
      });
    }
  });

  async function initApp() {
    try {
      state.user = await NyegaDB.getUser();
    } catch (e) {
      console.warn('Utilisateur non connecté:', e);
    }

    if (!state.user) {
      window.location.href = 'auth.html';
      return;
    }

    // Affichage utilisateur
    const displayName = state.user.user_metadata?.full_name || state.user.email?.split('@')[0] || 'Étudiant';
    const nameEl = document.getElementById('userDisplayName');
    const avatarEl = document.getElementById('userAvatarText');
    if (nameEl) nameEl.textContent = displayName;
    if (avatarEl) avatarEl.textContent = displayName.charAt(0).toUpperCase();

    // Bannière et boutons de configuration (retirés hors mode développement en production)
    const isDev = window.NYEGA_CONFIG && typeof window.NYEGA_CONFIG.isDevMode === 'function' && window.NYEGA_CONFIG.isDevMode();
    const banner = document.getElementById('connectionBanner');
    if (banner) {
      if (isDev) {
        banner.style.display = 'block';
      } else {
        banner.remove(); // Retiré complètement en production
      }
    }
    const configBtn = document.getElementById('btnConfigSupabase');
    if (configBtn && !isDev) {
      configBtn.remove();
    }
    const configModal = document.getElementById('configModal');
    if (configModal && !isDev) {
      configModal.remove();
    }

    // Clôture automatique au chargement des budgets expirés (non bloquante)
    await checkAndCloseExpiredBudgets();

    // Chargement des données
    try {
      state.categories = await NyegaDB.getCategories();
    } catch (e) {
      console.warn('Erreur chargement catégories:', e);
    }

    try {
      state.budget = await NyegaDB.getBudget();
    } catch (e) {
      console.warn('Erreur chargement budget:', e);
    }

    try {
      state.closedBudgets = await NyegaDB.getClosedBudgets();
      state.lastClosedBudget = (state.closedBudgets && state.closedBudgets[0]) || null;
    } catch (e) {
      console.warn('Erreur chargement budgets fermés:', e);
    }

    try {
      state.expenses = await NyegaDB.getExpenses();
      state.expensesLoadError = null;
    } catch (err) {
      console.error('Erreur chargement dépenses:', err);
      state.expenses = [];
      state.expensesLoadError = err.message || "Le serveur Supabase est injoignable. Vos dépenses n'ont pas pu être chargées.";
    }

    try {
      state.userRules = await NyegaDB.getUserRules();
    } catch (e) {
      console.warn('Erreur chargement règles:', e);
    }

    // Initialisation des écrans
    init1TapPickerList();
    initHistoryFilters();
    initBudgetForm();
    setDefaultExpenseDate();

    // GESTION DU CYCLE BUDGÉTAIRE
    if (!state.budget) {
      window.location.hash = '#budget';
      navigateToScreen('budget', false);
      if (state.lastClosedBudget) {
        showToast('⏰ Ta période est terminée. Définis un nouveau budget ou clique sur "Même budget, nouvelle période".', 6000);
      } else {
        openInitialBudgetModal();
      }
    } else {
      handleHashNavigation();
      renderDashboard();
    }

    loadHistoryExpenses();
    updateDetectedPill('Autres', 'auto');
  }

  // ==========================================================
  // NAVIGATION ENTRE ÉCRANS (Mobile & Desktop)
  // ==========================================================
  function handleHashNavigation() {
    const hash = window.location.hash.replace('#', '') || 'accueil';
    const allowed = ['accueil', 'ajout', 'historique', 'analyse', 'budget'];
    const screen = allowed.includes(hash) ? hash : 'accueil';
    navigateToScreen(screen, false);
  }

  function navigateToScreen(screenId, updateHash = true) {
    // Si l'étudiant tente d'accéder à l'accueil sans avoir défini de budget, redirection vers la saisie
    if (screenId === 'accueil' && !state.budget) {
      screenId = 'budget';
      openInitialBudgetModal();
      showToast('⚠️ Veuillez d\'abord définir votre budget pour accéder au tableau de bord.');
    }

    if (updateHash) {
      window.location.hash = '#' + screenId;
      return;
    }

    document.querySelectorAll('.ny-screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById('screen-' + screenId);
    if (target) target.classList.add('active');

    document.querySelectorAll('.ny-desktop-nav .ny-nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-screen') === screenId);
    });

    document.querySelectorAll('.ny-bottom-nav .ny-bottom-tab').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-screen') === screenId);
    });

    if (screenId === 'accueil') {
      renderDashboard();
    } else if (screenId === 'historique') {
      loadHistoryExpenses();
    } else if (screenId === 'analyse') {
      renderAnalytics();
    } else if (screenId === 'budget') {
      initBudgetForm();
    } else if (screenId === 'ajout') {
      setDefaultExpenseDate();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ==========================================================
  // ÉCRAN 2 : ACCUEIL & CALCULS DU BUDGET (EN FCFA)
  // ==========================================================
  function renderDashboard() {
    if (!state.budget) {
      // Redirection immédiate vers la saisie du budget au lieu d'afficher un accueil vide
      navigateToScreen('budget', true);
      openInitialBudgetModal();
      return;
    }

    const budgetTotal = Math.round(parseFloat(state.budget.monthly_amount || 0));

    // Calcul du dépensé uniquement sur la période du budget actif
    const startStr = state.budget.period_start;
    const endStr = state.budget.period_end;

    const totalSpent = state.expenses.reduce((sum, exp) => {
      const d = exp.expense_date;
      if (d && (!startStr || d >= startStr) && (!endStr || d <= endStr)) {
        return sum + Math.round(parseFloat(exp.amount || 0));
      }
      return sum;
    }, 0);

    const remaining = budgetTotal - totalSpent;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = endStr ? new Date(endStr) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const daysLeft = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const dailyRecommended = remaining > 0 ? Math.round(remaining / daysLeft) : 0;

    // Mise à jour DOM en FCFA
    const elRem = document.getElementById('homeRemainingAmount');
    if (elRem) elRem.innerText = formatFCFA(remaining);

    const elSpent = document.getElementById('homeSpentAmount');
    if (elSpent) elSpent.innerText = formatFCFA(totalSpent);

    const elTot = document.getElementById('homeTotalBudget');
    if (elTot) elTot.innerText = formatFCFA(budgetTotal);

    const elDaily = document.getElementById('homeDailyAmount');
    if (elDaily) elDaily.innerText = formatFCFA(dailyRecommended) + ' / jour';

    const elDays = document.getElementById('homeDaysLeft');
    if (elDays) elDays.innerText = daysLeft;

    const elEnd = document.getElementById('homePeriodEnd');
    if (elEnd) elEnd.innerText = 'Fin : ' + formatDateFr(end);

    // Phrase discrète sur l'accueil
    const noticeEl = document.getElementById('homePreviousPeriodNotice');
    const startNoticeEl = document.getElementById('homePeriodStartDateNotice');
    if (noticeEl && startNoticeEl) {
      if (startStr) {
        startNoticeEl.innerText = formatDateFr(startStr);
        noticeEl.style.display = 'block';
      } else {
        noticeEl.style.display = 'none';
      }
    }

    // Indicateur de statut : Vert (#16A34A) / Orange (#D97706) / Rouge (#DC2626)
    const ratioSpent = budgetTotal > 0 ? (totalSpent / budgetTotal) : 1;
    const statusPill = document.getElementById('homeStatusPill');
    const statusText = document.getElementById('homeStatusText');
    const progressBar = document.getElementById('homeProgressBar');

    let percentBar = Math.min(100, Math.max(0, ratioSpent * 100));
    if (progressBar) progressBar.style.width = percentBar + '%';

    if (remaining <= 0 || ratioSpent >= 0.90) {
      if (statusPill) statusPill.className = 'ny-status-pill status-red';
      if (statusText) statusText.innerText = remaining <= 0 ? 'Budget Dépassé !' : 'Seuil Critique';
      if (progressBar) progressBar.className = 'ny-progress-bar-fill fill-red';
    } else if (ratioSpent >= 0.75) {
      if (statusPill) statusPill.className = 'ny-status-pill status-orange';
      if (statusText) statusText.innerText = 'Rythme Élevé';
      if (progressBar) progressBar.className = 'ny-progress-bar-fill fill-orange';
    } else {
      if (statusPill) statusPill.className = 'ny-status-pill status-green';
      if (statusText) statusText.innerText = 'Budget Maîtrisé';
      if (progressBar) progressBar.className = 'ny-progress-bar-fill fill-green';
    }

    renderRecentExpenses();
    renderCaisseCard();
  }

  async function renderCaisseCard() {
    const balanceEl = document.getElementById('homeCaisseBalance');
    const listEl = document.getElementById('homeCaisseMovementsList');
    const emptyEl = document.getElementById('homeCaisseEmpty');
    const errorEl = document.getElementById('homeCaisseError');
    if (!balanceEl || !listEl) return;

    if (errorEl) errorEl.style.display = 'none';
    if (emptyEl) emptyEl.style.display = 'none';

    try {
      const balance = await NyegaDB.getCaisseBalance();
      balanceEl.innerText = formatFCFA(balance);

      const movements = await NyegaDB.getCaisseMovements();
      if (!movements || movements.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
      } else {
        const recent = movements.slice(0, 3);
        listEl.innerHTML = recent.map(m => {
          const amt = Number(m.amount) || 0;
          const isPositive = amt > 0;
          const amtClass = isPositive ? 'text-success' : 'text-danger';
          const sign = isPositive ? '+' : '';
          const dateStr = m.created_at ? formatDateFr(m.created_at.split('T')[0]) : '';
          const noteStr = escapeHTML(m.note || (m.type === 'leftover' ? 'Économies période terminée' : 'Mouvement de caisse'));
          return `
            <div class="d-flex justify-content-between align-items-center py-2 border-bottom" style="font-size:13px;">
              <div>
                <div class="font-weight-bold" style="color:var(--ny-on-surface);">${noteStr}</div>
                <div class="text-muted" style="font-size:11px;">${dateStr}</div>
              </div>
              <div class="font-weight-bold ${amtClass}" style="white-space:nowrap;">
                ${sign}${formatFCFA(Math.abs(amt))}
              </div>
            </div>
          `;
        }).join('');
      }
    } catch (err) {
      console.warn('Erreur rendu caisse:', err.message);
      balanceEl.innerText = '-- FCFA';
      listEl.innerHTML = '';
      if (emptyEl) emptyEl.style.display = 'none';
      if (errorEl) {
        errorEl.style.display = 'block';
        errorEl.innerText = 'Caisse indisponible, réessaie';
      }
    }
  }

  function renderRecentExpenses() {
    const listEl = document.getElementById('homeRecentExpensesList');
    if (!listEl) return;

    if (state.expensesLoadError) {
      listEl.innerHTML = `
        <div class="ny-empty-state">
          <i class="fa fa-exclamation-triangle text-danger" style="font-size:32px; margin-bottom:10px;"></i>
          <p class="font-weight-bold mb-1 text-danger">Serveur Supabase injoignable</p>
          <p class="small text-muted mb-0">${escapeHTML(state.expensesLoadError)}</p>
        </div>
      `;
      return;
    }

    if (state.expenses.length === 0) {
      listEl.innerHTML = `
        <div class="ny-empty-state">
          <i class="fa fa-shopping-bag"></i>
          <p class="font-weight-bold mb-1">Aucune dépense enregistrée</p>
          <p class="small text-muted mb-3">Enregistrez votre première dépense en FCFA.</p>
          <button type="button" class="ny-btn ny-btn-primary ny-btn-sm" onclick="navigateToScreen('ajout')">
            <i class="fa fa-plus mr-1"></i> Ajouter une dépense
          </button>
        </div>
      `;
      return;
    }

    const recent = state.expenses.slice(0, 4);
    listEl.innerHTML = recent.map(exp => createExpenseItemHTML(exp, false)).join('');
  }

  // ==========================================================
  // ÉCRAN 3 : AJOUT RAPIDE & CATÉGORISATION AUTOMATIQUE
  // ==========================================================
  function setQuickAmount(amount) {
    const input = document.getElementById('expenseAmount');
    if (!input) return;
    const current = parseInt(input.value, 10) || 0;
    input.value = current + amount;
    input.focus();
  }

  function setDefaultExpenseDate() {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  // Détection en direct lors de la frappe
  function onDescriptionInputChange() {
    clearTimeout(state.autoCatDebounceTimer);
    const desc = document.getElementById('expenseDescription')?.value?.trim() || '';

    if (!desc) {
      updateDetectedPill('Autres', 'auto');
      return;
    }

    // Essai immédiat avec Mémoire utilisateur + Dictionnaire local
    const localMatch = window.resolveCategoryLocal(desc, state.userRules);
    if (localMatch) {
      const srcLabel = localMatch.source === 'user_rule' ? 'mémorisé' : 'local';
      updateDetectedPill(localMatch.category, srcLabel);
    } else {
      updateDetectedPill('Autres', 'auto');
    }
  }

  function updateDetectedPill(categoryName, source = 'auto') {
    state.currentFormCategory = categoryName;
    const cat = state.categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase()) || {
      name: categoryName,
      icon: 'fa-tag',
      color: '#64748B'
    };

    const pill = document.getElementById('detectedCategoryPill');
    const nameEl = document.getElementById('detectedCategoryName');
    const iconEl = document.getElementById('detectedCategoryIcon');
    const srcEl = document.getElementById('detectedCategorySource');
    const hidden = document.getElementById('selectedCategoryId');

    if (nameEl) nameEl.textContent = cat.name;
    if (iconEl) iconEl.className = 'fa ' + (cat.icon || 'fa-tag');
    if (srcEl) srcEl.textContent = source;
    if (pill) {
      pill.style.background = cat.color + '1A';
      pill.style.color = cat.color;
      pill.style.borderColor = cat.color + '40';
    }
    if (hidden) hidden.value = cat.id || cat.name;
  }

  // Soumission de dépense avec résolution en 4 étapes
  async function handleCreateExpense(event) {
    event.preventDefault();
    const amountVal = document.getElementById('expenseAmount').value;
    const description = document.getElementById('expenseDescription').value.trim();
    const expenseDate = document.getElementById('expenseDate').value;
    const paymentMethod = document.getElementById('expensePaymentMethod').value;

    const amount = Math.round(parseFloat(amountVal));
    if (!amount || amount <= 0) {
      showToast('Veuillez saisir un montant valide en FCFA');
      return;
    }

    const btn = document.getElementById('btnAddExpenseSubmit');
    setBtnLoading(btn, true);

    try {
      let finalCategoryName = state.currentFormCategory;

      // Si pas encore déterminé ou resté sur 'Autres', on lance la chaîne complète
      if (!finalCategoryName || finalCategoryName === 'Autres') {
        const resolution = await NyegaDB.categorizeExpense(description);
        finalCategoryName = resolution.category || 'Autres';
      }

      // Recherche de l'ID de catégorie
      let categoryObj = state.categories.find(c => c.name.toLowerCase() === finalCategoryName.toLowerCase());
      if (!categoryObj && state.categories.length > 0) {
        categoryObj = state.categories.find(c => c.name === 'Autres') || state.categories[0];
      }

      const newExp = await NyegaDB.addExpense({
        amount: amount,
        category_id: categoryObj?.id,
        description: description,
        expense_date: expenseDate,
        payment_method: paymentMethod
      });

      state.expenses.unshift(newExp);
      state.expensesLoadError = null;

      showToast(`Dépense de ${formatFCFA(amount)} enregistrée (${finalCategoryName}) !`);

      // Réinitialisation formulaire uniquement en cas de succès
      document.getElementById('formAddExpense').reset();
      setDefaultExpenseDate();
      updateDetectedPill('Autres', 'auto');

      setTimeout(() => {
        navigateToScreen('accueil');
      }, 350);

    } catch (err) {
      console.error('Échec ajout dépense:', err);
      const msg = err.message || "Impossible d'enregistrer la dépense : le serveur Supabase est injoignable. Votre dépense n'a pas été enregistrée.";
      const dateErrorEl = document.getElementById('expenseDateError');

      if (msg.includes('Cette période est terminée') || msg.includes('période est terminée') || msg.includes('choisis une date plus récente')) {
        if (dateErrorEl) {
          dateErrorEl.textContent = 'Cette période est terminée, choisis une date plus récente.';
          dateErrorEl.classList.remove('d-none');
          dateErrorEl.style.display = 'block';
        }
        showToast('❌ Cette période est terminée, choisis une date plus récente.');
      } else {
        showToast(`❌ ${msg}`);
      }
    } finally {
      setBtnLoading(btn, false);
    }
  }

  // ==========================================================
  // SYSTÈME DE CORRECTION EN 1 TAP & APPRENTISSAGE
  // ==========================================================
  function init1TapPickerList() {
    const listEl = document.getElementById('category1TapList');
    if (!listEl) return;

    listEl.innerHTML = '';
    state.categories.forEach(cat => {
      const item = document.createElement('div');
      item.className = 'ny-1tap-item';
      item.onclick = function() {
        select1TapCategory(cat.name, cat.id);
      };

      const iconDiv = document.createElement('div');
      iconDiv.className = 'ny-1tap-icon';
      iconDiv.style.background = (cat.color || '#002D7A') + '15';
      iconDiv.style.color = cat.color || '#002D7A';

      const icon = document.createElement('i');
      icon.className = 'fa ' + (cat.icon || 'fa-tag');
      iconDiv.appendChild(icon);

      const textDiv = document.createElement('div');
      const nameDiv = document.createElement('div');
      nameDiv.className = 'ny-1tap-name';
      nameDiv.textContent = cat.name;

      const descSmall = document.createElement('small');
      descSmall.className = 'text-muted';
      descSmall.textContent = 'Classer dans ' + cat.name;

      textDiv.appendChild(nameDiv);
      textDiv.appendChild(descSmall);

      item.appendChild(iconDiv);
      item.appendChild(textDiv);
      listEl.appendChild(item);
    });
  }

  function open1TapCategoryPicker(targetContext) {
    state.pickerTarget = targetContext; // 'form' ou expenseId
    const modal = document.getElementById('modal1TapCategory');
    if (modal) modal.style.display = 'flex';
  }

  function close1TapCategoryPicker() {
    const modal = document.getElementById('modal1TapCategory');
    if (modal) modal.style.display = 'none';
    state.pickerTarget = null;
  }

  async function select1TapCategory(categoryName, categoryId) {
    const target = state.pickerTarget;
    close1TapCategoryPicker();

    if (target === 'form') {
      // Modification dans le formulaire
      updateDetectedPill(categoryName, 'corrigé');

      // Mémorisation du mot-clé principal dans category_rules
      const desc = document.getElementById('expenseDescription')?.value?.trim();
      if (desc) {
        const keyword = extractMainKeyword(desc);
        await NyegaDB.saveUserRule(keyword, categoryName);
        state.userRules = await NyegaDB.getUserRules();
        showToast(`Règle mémorisée : "${keyword}" → ${categoryName}`);
      }

    } else if (typeof target === 'string' && target.startsWith('exp-')) {
      // Modification directe d'une dépense existante depuis l'historique
      const exp = state.expenses.find(e => e.id === target);
      if (exp) {
        exp.category_id = categoryId;
        await NyegaDB.updateExpense(exp.id, exp);

        // Mémorisation de la règle
        if (exp.description) {
          const keyword = extractMainKeyword(exp.description);
          await NyegaDB.saveUserRule(keyword, categoryName);
          state.userRules = await NyegaDB.getUserRules();
          showToast(`Corrigé ! "${keyword}" sera toujours classé en ${categoryName}`);
        } else {
          showToast(`Catégorie mise à jour : ${categoryName}`);
        }

        loadHistoryExpenses();
        renderDashboard();
      }
    }
  }

  // Extraction du mot-clé significatif : algorithme canonique défini dans js/local-dictionary.js
  const extractMainKeyword = function(description) {
    if (typeof window.extractMainKeyword === 'function') {
      return window.extractMainKeyword(description, window.LOCAL_DICTIONARY);
    }
    return (window.normalizeText ? window.normalizeText(description) : description).split(' ')[0] || description;
  };

  // ==========================================================
  // ÉCRAN 4 : HISTORIQUE DES DÉPENSES
  // ==========================================================
  function initHistoryFilters() {
    const selCat = document.getElementById('historyFilterCategory');
    const editCat = document.getElementById('editExpenseCategory');
    if (!selCat) return;

    selCat.innerHTML = '';
    const allOpt = document.createElement('option');
    allOpt.value = 'all';
    allOpt.textContent = 'Toutes les catégories';
    selCat.appendChild(allOpt);

    if (editCat) editCat.innerHTML = '';

    state.categories.forEach(cat => {
      const opt1 = document.createElement('option');
      opt1.value = cat.id;
      opt1.textContent = cat.name;
      selCat.appendChild(opt1);

      if (editCat) {
        const opt2 = document.createElement('option');
        opt2.value = cat.id;
        opt2.textContent = cat.name;
        editCat.appendChild(opt2);
      }
    });
  }

  function loadHistoryExpenses() {
    const listEl = document.getElementById('fullExpensesList');
    if (!listEl) return;

    if (state.expensesLoadError) {
      listEl.innerHTML = `
        <div class="ny-empty-state">
          <i class="fa fa-exclamation-triangle text-danger" style="font-size:32px; margin-bottom:10px;"></i>
          <p class="font-weight-bold mb-1 text-danger">Serveur Supabase injoignable</p>
          <p class="small text-muted mb-0">${escapeHTML(state.expensesLoadError)}</p>
        </div>
      `;
      const countBadge = document.getElementById('historyCountBadge');
      if (countBadge) countBadge.innerText = 'Indisponible';
      renderHistoryClosedBudgets();
      return;
    }

    const periodFilter = document.getElementById('historyFilterPeriod')?.value || 'current';
    const catFilter = document.getElementById('historyFilterCategory')?.value || 'all';
    const sortVal = document.getElementById('historySortBy')?.value || 'date-desc';

    let filtered = [...state.expenses];

    // Filtrage par période (Cette période, Période précédente, Tout)
    if (periodFilter === 'current' && state.budget) {
      filtered = filtered.filter(e => {
        const d = e.expense_date;
        return (!state.budget.period_start || d >= state.budget.period_start) &&
               (!state.budget.period_end || d <= state.budget.period_end);
      });
    } else if (periodFilter === 'previous') {
      const prevBudget = state.lastClosedBudget;
      if (prevBudget) {
        filtered = filtered.filter(e => {
          const d = e.expense_date;
          return (!prevBudget.period_start || d >= prevBudget.period_start) &&
                 (!prevBudget.period_end || d <= prevBudget.period_end);
        });
      } else {
        filtered = [];
      }
    }

    if (catFilter !== 'all') {
      filtered = filtered.filter(e => e.category_id === catFilter);
    }

    if (sortVal === 'date-desc') {
      filtered.sort((a, b) => new Date(b.expense_date) - new Date(a.expense_date));
    } else if (sortVal === 'date-asc') {
      filtered.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date));
    } else if (sortVal === 'amount-desc') {
      filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    } else if (sortVal === 'amount-asc') {
      filtered.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    }

    const countBadge = document.getElementById('historyCountBadge');
    if (countBadge) countBadge.innerText = filtered.length + ' dépense' + (filtered.length > 1 ? 's' : '');

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="ny-empty-state">
          <i class="fa fa-filter"></i>
          <p class="font-weight-bold mb-1">Aucune dépense trouvée</p>
          <p class="small text-muted">Ajustez vos filtres ou enregistrez une nouvelle dépense.</p>
        </div>
      `;
    } else {
      listEl.innerHTML = filtered.map(exp => createExpenseItemHTML(exp, true)).join('');
    }

    renderHistoryClosedBudgets();
  }

  async function renderHistoryClosedBudgets() {
    const container = document.getElementById('historyClosedBudgetsContainer');
    const list = document.getElementById('historyClosedBudgetsList');
    if (!container || !list) return;

    if (!state.closedBudgets && NyegaDB.isLive()) {
      try {
        state.closedBudgets = await NyegaDB.getClosedBudgets();
        state.lastClosedBudget = (state.closedBudgets && state.closedBudgets[0]) || null;
      } catch (e) {
        console.warn('Erreur chargement budgets fermés:', e);
      }
    }

    const closed = state.closedBudgets || [];
    if (closed.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = closed.map(b => {
      const budgetAmt = Math.round(Number(b.monthly_amount) || 0);

      const spent = state.expenses.reduce((acc, exp) => {
        const d = exp.expense_date;
        if (d && (!b.period_start || d >= b.period_start) && (!b.period_end || d <= b.period_end)) {
          return acc + Math.round(Number(exp.amount) || 0);
        }
        return acc;
      }, 0);

      const leftover = (b.closing_leftover != null) ? Number(b.closing_leftover) : Math.max(0, budgetAmt - spent);
      const overspend = (b.closing_overspend != null) ? Number(b.closing_overspend) : Math.max(0, spent - budgetAmt);

      let resultBadge = '';
      if (leftover > 0) {
        resultBadge = `<span class="badge badge-success px-2 py-1">+${formatFCFA(leftover)} versé en caisse</span>`;
      } else if (overspend > 0) {
        resultBadge = `<span class="badge badge-warning px-2 py-1">-${formatFCFA(overspend)} dépassement</span>`;
      } else {
        resultBadge = `<span class="badge badge-secondary px-2 py-1">0 FCFA équilibré</span>`;
      }

      return `
        <div class="p-3 mb-2 rounded border" style="background:var(--ny-surface-variant);">
          <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap" style="gap:6px;">
            <strong style="color:var(--ny-primary); font-size:14px;">
              <i class="fa fa-calendar-o mr-1"></i> Du ${formatDateFr(b.period_start)} au ${formatDateFr(b.period_end)}
            </strong>
            ${resultBadge}
          </div>
          <div class="small text-muted d-flex justify-content-between flex-wrap" style="gap:10px;">
            <span>Budget alloué : <strong class="text-dark">${formatFCFA(budgetAmt)}</strong></span>
            <span>Total dépensé : <strong class="text-dark">${formatFCFA(spent)}</strong></span>
          </div>
        </div>
      `;
    }).join('');
  }

  function createExpenseItemHTML(exp, withActions = true) {
    const cat = state.categories.find(c => c.id === exp.category_id) || {
      name: 'Autres',
      icon: 'fa-tag',
      color: '#64748B'
    };

    // Assainissement strict pour éviter tout XSS ou breakout d'attributs HTML
    const rawId = String(exp.id || '');
    const safeExpId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeCatName = escapeHTML(cat.name || 'Autres');
    const safeCatIcon = /^[a-zA-Z0-9_-]+$/.test(cat.icon || '') ? cat.icon : 'fa-tag';
    const safeCatColor = /^#[0-9a-fA-F]{3,8}$/.test(cat.color || '') ? cat.color : '#64748B';
    const safeDescription = escapeHTML(exp.description || cat.name || 'Dépense');
    const safeDate = escapeHTML(formatDateFr(exp.expense_date));
    const safeAmount = escapeHTML(formatFCFA(exp.amount));

    // Pastille de catégorie cliquable en 1 tap avec identifiant assaini
    const categoryBadgeHTML = `
      <span class="badge" style="background:${safeCatColor}18; color:${safeCatColor}; cursor:pointer; font-weight:700; padding:4px 8px; border-radius:6px;" title="Changer en 1 tap" onclick="open1TapCategoryPicker('${safeExpId}')">
        <i class="fa ${safeCatIcon} mr-1"></i> ${safeCatName} <i class="fa fa-caret-down ml-1 text-muted"></i>
      </span>
    `;

    const actionsHTML = withActions ? `
      <div class="ny-expense-actions">
        <button type="button" class="ny-icon-btn" title="Modifier" onclick="openEditModal('${safeExpId}')">
          <i class="fa fa-pencil"></i>
        </button>
        <button type="button" class="ny-icon-btn btn-delete" title="Supprimer" onclick="confirmDeleteExpense('${safeExpId}')">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    ` : '';

    return `
      <div class="ny-expense-item" id="item-${safeExpId}">
        <div class="ny-expense-left">
          <div class="ny-expense-cat-icon" style="background:${safeCatColor}15; color:${safeCatColor};">
            <i class="fa ${safeCatIcon}"></i>
          </div>
          <div>
            <div class="ny-expense-title">${safeDescription}</div>
            <div class="ny-expense-meta">
              ${categoryBadgeHTML}
              <span>•</span>
              <span>${safeDate}</span>
            </div>
          </div>
        </div>
        <div class="ny-expense-right">
          <div class="ny-expense-amount">- ${safeAmount}</div>
          ${actionsHTML}
        </div>
      </div>
    `;
  }

  // Modale édition classique
  window.openEditModal = function(expId) {
    const exp = state.expenses.find(e => e.id === expId);
    if (!exp) return;

    document.getElementById('editExpenseId').value = exp.id;
    document.getElementById('editExpenseAmount').value = exp.amount;
    document.getElementById('editExpenseDesc').value = exp.description;
    document.getElementById('editExpenseDate').value = exp.expense_date;
    document.getElementById('editExpenseCategory').value = exp.category_id;

    document.getElementById('modalEditExpense').style.display = 'flex';
  };

  window.closeEditModal = function() {
    document.getElementById('modalEditExpense').style.display = 'none';
  };

  window.handleUpdateExpense = async function(event) {
    event.preventDefault();
    const id = document.getElementById('editExpenseId').value;
    const amount = Math.round(parseFloat(document.getElementById('editExpenseAmount').value));
    const description = document.getElementById('editExpenseDesc').value.trim();
    const expense_date = document.getElementById('editExpenseDate').value;
    const category_id = document.getElementById('editExpenseCategory').value;

    try {
      await NyegaDB.updateExpense(id, {
        amount,
        description,
        expense_date,
        category_id
      });

      const idx = state.expenses.findIndex(e => e.id === id);
      if (idx !== -1) {
        state.expenses[idx] = { ...state.expenses[idx], amount, description, expense_date, category_id };
      }

      closeEditModal();
      showToast('Dépense mise à jour avec succès !');
      loadHistoryExpenses();
      renderDashboard();
    } catch (err) {
      showToast('Erreur : ' + err.message);
    }
  };

  window.confirmDeleteExpense = async function(expId) {
    if (!confirm('Supprimer cette dépense ?')) return;

    try {
      await NyegaDB.deleteExpense(expId);
      state.expenses = state.expenses.filter(e => e.id !== expId);
      showToast('Dépense supprimée.');
      loadHistoryExpenses();
      renderDashboard();
    } catch (err) {
      showToast('Erreur de suppression : ' + err.message);
    }
  };

  // ==========================================================
  // ÉCRAN 5 : ANALYSE (EN FCFA)
  // ==========================================================
  function renderAnalytics() {
    const totalSpent = state.expenses.reduce((s, e) => s + Math.round(parseFloat(e.amount || 0)), 0);

    const daysElapsed = Math.max(1, new Date().getDate());
    const avgPerDay = totalSpent > 0 ? Math.round(totalSpent / daysElapsed) : 0;
    const elAvg = document.getElementById('statsAvgPerDay');
    if (elAvg) elAvg.innerText = formatFCFA(avgPerDay);

    const catMap = {};
    state.categories.forEach(c => {
      catMap[c.id] = { name: c.name, color: c.color, total: 0 };
    });

    let maxExpense = 0;
    state.expenses.forEach(e => {
      const amt = Math.round(parseFloat(e.amount || 0));
      if (amt > maxExpense) maxExpense = amt;
      if (catMap[e.category_id]) {
        catMap[e.category_id].total += amt;
      } else {
        if (!catMap['other']) catMap['other'] = { name: 'Autres', color: '#64748B', total: 0 };
        catMap['other'].total += amt;
      }
    });

    const elMax = document.getElementById('statsMaxExpense');
    if (elMax) elMax.innerText = formatFCFA(maxExpense);

    let topCatName = 'Aucun';
    let topCatVal = 0;
    Object.values(catMap).forEach(c => {
      if (c.total > topCatVal) {
        topCatVal = c.total;
        topCatName = c.name;
      }
    });

    const elTop = document.getElementById('statsTopCategory');
    if (elTop) elTop.innerText = topCatName;

    const tbody = document.getElementById('analyticsTableBody');
    if (tbody) {
      tbody.innerHTML = '';
      const sortedCats = Object.values(catMap).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
      if (sortedCats.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 3;
        td.className = 'text-center text-muted py-3';
        td.textContent = 'Aucune dépense enregistrée.';
        tr.appendChild(td);
        tbody.appendChild(tr);
      } else {
        sortedCats.forEach(c => {
          const pct = totalSpent > 0 ? ((c.total / totalSpent) * 100).toFixed(1) : '0.0';
          const tr = document.createElement('tr');

          // Catégorie
          const tdCat = document.createElement('td');
          const dot = document.createElement('span');
          dot.className = 'd-inline-block rounded-circle mr-2';
          dot.style.width = '10px';
          dot.style.height = '10px';
          dot.style.background = c.color || '#64748B';
          const strongName = document.createElement('strong');
          strongName.textContent = c.name;
          tdCat.appendChild(dot);
          tdCat.appendChild(strongName);

          // Montant
          const tdAmount = document.createElement('td');
          const strongAmount = document.createElement('strong');
          strongAmount.textContent = formatFCFA(c.total);
          tdAmount.appendChild(strongAmount);

          // Pourcentage
          const tdPct = document.createElement('td');
          const badge = document.createElement('span');
          badge.className = 'badge badge-light border';
          badge.textContent = `${pct} %`;
          tdPct.appendChild(badge);

          tr.appendChild(tdCat);
          tr.appendChild(tdAmount);
          tr.appendChild(tdPct);
          tbody.appendChild(tr);
        });
      }
    }

    renderChart(catMap);
  }

  function renderChart(catMap) {
    const canvas = document.getElementById('categoryDonutChart');
    if (!canvas || !window.Chart) return;

    const activeCats = Object.values(catMap).filter(c => c.total > 0);
    const labels = activeCats.map(c => c.name);
    const data = activeCats.map(c => c.total);
    const colors = activeCats.map(c => c.color);

    if (state.chartInstance) {
      state.chartInstance.destroy();
    }

    if (activeCats.length === 0) {
      labels.push('Aucune dépense');
      data.push(1);
      colors.push('#E2E8F0');
    }

    state.chartInstance = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              font: { family: 'DM Sans', size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return ' ' + context.label + ' : ' + formatFCFA(context.raw);
              }
            }
          }
        }
      }
    });
  }

  // ==========================================================
  // ÉCRAN 6 : CONFIGURATION DU BUDGET (FCFA)
  // ==========================================================
  async function initBudgetForm() {
    const bAmt = document.getElementById('budgetAmount');
    const bStart = document.getElementById('budgetStartDate');
    const bEnd = document.getElementById('budgetEndDate');
    const bStartHelp = document.getElementById('budgetStartDateHelp');
    const boxNext = document.getElementById('boxNextPeriodBudget');

    const hasActiveBudget = !!(state.budget && state.budget.status === 'active');

    if (!state.lastClosedBudget && NyegaDB.isLive()) {
      try {
        state.lastClosedBudget = await NyegaDB.getLastClosedBudget();
      } catch (e) {}
    }

    if (boxNext) {
      boxNext.style.display = (!hasActiveBudget && state.lastClosedBudget) ? 'block' : 'none';
    }

    if (bAmt) {
      if (state.budget) {
        bAmt.value = state.budget.monthly_amount;
      } else if (state.lastClosedBudget) {
        bAmt.value = state.lastClosedBudget.monthly_amount;
      }
    }

    if (bStart) {
      if (state.budget && state.budget.period_start) {
        bStart.value = state.budget.period_start;
      }
      if (hasActiveBudget) {
        bStart.disabled = true;
        if (bStartHelp) {
          bStartHelp.classList.remove('d-none');
          bStartHelp.style.display = 'block';
          bStartHelp.textContent = 'La date de début ne peut pas être changée.';
        }
      } else {
        bStart.disabled = false;
        if (bStartHelp) {
          bStartHelp.classList.add('d-none');
          bStartHelp.style.display = 'none';
        }
      }
    }

    if (bEnd && state.budget && state.budget.period_end) {
      bEnd.value = state.budget.period_end;
    }
  }

  async function handleProposeNextPeriodBudget() {
    if (!state.lastClosedBudget && NyegaDB.isLive()) {
      state.lastClosedBudget = await NyegaDB.getLastClosedBudget();
    }
    if (!state.lastClosedBudget) {
      showToast('Aucun budget précédent trouvé.');
      return;
    }

    const prevEndStr = state.lastClosedBudget.period_end;
    const prevEnd = new Date(prevEndStr);
    const nextStart = new Date(prevEnd);
    nextStart.setDate(nextStart.getDate() + 1);
    const nextStartStr = nextStart.toISOString().split('T')[0];

    const nextEnd = new Date(nextStart.getFullYear(), nextStart.getMonth() + 1, 0);
    const nextEndStr = nextEnd.toISOString().split('T')[0];

    const bAmt = document.getElementById('budgetAmount');
    const bStart = document.getElementById('budgetStartDate');
    const bEnd = document.getElementById('budgetEndDate');
    const bStartHelp = document.getElementById('budgetStartDateHelp');

    if (bAmt) bAmt.value = state.lastClosedBudget.monthly_amount;
    if (bStart) {
      bStart.value = nextStartStr;
      bStart.disabled = false;
    }
    if (bStartHelp) {
      bStartHelp.classList.add('d-none');
      bStartHelp.style.display = 'none';
    }
    if (bEnd) bEnd.value = nextEndStr;

    showToast(`Nouvelle période proposée : du ${formatDateFr(nextStartStr)} au ${formatDateFr(nextEndStr)}. Vérifiez et validez !`);
  }

  async function handleSaveBudget(event) {
    event.preventDefault();
    const amountVal = document.getElementById('budgetAmount').value;
    const startDate = document.getElementById('budgetStartDate').value;
    const endDate = document.getElementById('budgetEndDate').value;

    const amount = Math.round(parseFloat(amountVal));
    if (!amount || amount <= 0) {
      showToast('Veuillez spécifier un budget valide en FCFA (entier positif)');
      return;
    }

    if (!startDate || !endDate) {
      showToast('Veuillez renseigner les dates de début et de fin de période.');
      return;
    }

    if (endDate < startDate) {
      showToast('La date de fin ne peut pas être antérieure à la date de début.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (endDate < todayStr) {
      showToast('La date de fin ne peut pas être dans le passé.');
      return;
    }

    const btn = document.getElementById('btnSaveBudget');
    setBtnLoading(btn, true);

    try {
      const updated = await NyegaDB.saveBudget({
        monthly_amount: amount,
        period_start: startDate,
        period_end: endDate
      });

      state.budget = updated;
      showToast(`Budget enregistré : ${formatFCFA(amount)} !`);
      renderDashboard();
      initBudgetForm();

      setTimeout(() => {
        navigateToScreen('accueil');
      }, 400);
    } catch (err) {
      showToast('Erreur : ' + (err.message || 'Impossible d\'enregistrer'));
    } finally {
      setBtnLoading(btn, false);
    }
  }

  // ==========================================================
  // LOGOUT & UTILITAIRES
  // ==========================================================
  async function handleLogout() {
    if (confirm('Voulez-vous vous déconnecter de NyeGa ?')) {
      try {
        await NyegaDB.signOut();
      } catch (err) {
        console.error('Erreur lors du signOut :', err);
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      window.location.href = 'auth.html';
    }
  }

  function showToast(msg) {
    const toast = document.getElementById('nyegaToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3200);
  }

  function setBtnLoading(btn, isLoading) {
    if (!btn) return;
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.spinner-border');
    if (isLoading) {
      btn.disabled = true;
      if (spinner) spinner.classList.remove('d-none');
    } else {
      btn.disabled = false;
      if (spinner) spinner.classList.add('d-none');
    }
  }

  function formatDateFr(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function(m) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
  }

  // ==========================================================
  // MODALE OBLIGATOIRE DE BUDGET INITIAL
  // ==========================================================
  function openInitialBudgetModal() {
    const modal = document.getElementById('modalInitialBudget');
    if (modal) {
      modal.style.display = 'flex';
      const input = document.getElementById('initialModalBudgetAmount');
      if (input) {
        input.value = '';
        input.focus();
      }
    }
  }

  function closeInitialBudgetModal() {
    const modal = document.getElementById('modalInitialBudget');
    if (modal) modal.style.display = 'none';
    if (!state.budget) {
      // Si l'étudiant ferme sans saisir, on le maintient sur l'écran budget
      navigateToScreen('budget', false);
      const bAmt = document.getElementById('budgetAmount');
      if (bAmt) bAmt.focus();
      showToast('💡 Veuillez définir votre budget mensuel ci-dessous pour initialiser votre tableau de bord.');
    }
  }

  function setModalQuickBudget(amount) {
    const input = document.getElementById('initialModalBudgetAmount');
    if (input) {
      input.value = amount;
      input.focus();
    }
  }

  async function handleInitialModalBudgetSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('initialModalBudgetAmount');
    const amount = Math.round(parseFloat(input?.value || 0));

    if (!amount || amount <= 0) {
      showToast('Veuillez saisir un montant de budget valide en FCFA');
      return;
    }

    const btn = document.getElementById('btnModalInitialBudgetSubmit');
    setBtnLoading(btn, true);

    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const saved = await NyegaDB.saveBudget({
        monthly_amount: amount,
        period_start: firstDay,
        period_end: lastDay
      });

      state.budget = saved;
      const modal = document.getElementById('modalInitialBudget');
      if (modal) modal.style.display = 'none';
      showToast(`Budget configuré : ${formatFCFA(amount)} !`);
      renderDashboard();
      initBudgetForm();
      navigateToScreen('accueil');
    } catch (err) {
      showToast('Erreur : ' + (err.message || 'Impossible d\'enregistrer'));
    } finally {
      setBtnLoading(btn, false);
    }
  }

  // Modale de configuration (accessible uniquement en mode développement)
  function openConfigModal() {
    if (!window.NYEGA_CONFIG || !window.NYEGA_CONFIG.isDevMode()) return;
    const modal = document.getElementById('configModal');
    if (modal) modal.style.display = 'flex';
  }

  function closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) modal.style.display = 'none';
  }

  function handleSaveConfig(event) {
    event.preventDefault();
    if (!window.NYEGA_CONFIG || !window.NYEGA_CONFIG.isDevMode()) return;
    const url = document.getElementById('cfgUrl')?.value?.trim();
    const anonKey = document.getElementById('cfgAnonKey')?.value?.trim();
    if (window.NYEGA_CONFIG.saveConfig) {
      window.NYEGA_CONFIG.saveConfig(url, anonKey);
      window.NyegaDB.reconnect();
    }
    closeConfigModal();
    showToast('Configuration Supabase enregistrée.');
    setTimeout(() => window.location.reload(), 400);
  }

  // ==========================================================
  // EXPORT CSV & SUPPRESSION DE COMPTE (Loi 2019-014 Togo)
  // ==========================================================
  function sanitizeCSVField(val) {
    let str = String(val == null ? '' : val);
    // Protection anti-CSV Injection (CWE-1236) : neutralise =, +, -, @, tab, newline (y compris précédés d'espaces)
    if (/^\s*[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return `"${str.replace(/"/g, '""')}"`;
  }

  async function exportCaisseCSV() {
    try {
      const movements = await NyegaDB.getCaisseMovements();
      if (!movements || movements.length === 0) {
        return false;
      }
      const headers = ['Date', 'Montant (FCFA)', 'Type', 'Note'];
      const rows = movements.map(m => {
        const cleanDate = sanitizeCSVField(m.created_at ? m.created_at.split('T')[0] : '');
        const cleanAmount = Math.round(Number(m.amount) || 0);
        const cleanType = sanitizeCSVField(m.type || '');
        const cleanNote = sanitizeCSVField(m.note || '');
        return [cleanDate, cleanAmount, cleanType, cleanNote].join(';');
      });
      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `nyega_caisse_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (e) {
      console.warn('Erreur export caisse CSV:', e);
      return false;
    }
  }

  async function exportExpensesCSV() {
    let hasExportedAny = false;

    if (state.expenses && state.expenses.length > 0) {
      const headers = ['Date', 'Montant (FCFA)', 'Catégorie', 'Moyen de Paiement', 'Description'];
      const rows = state.expenses.map(exp => {
        const cat = state.categories.find(c => c.id === exp.category_id);
        const catName = cat ? cat.name : 'Autres';
        const cleanDate = sanitizeCSVField(exp.expense_date || '');
        const cleanAmount = Math.round(Number(exp.amount) || 0);
        const cleanCat = sanitizeCSVField(catName);
        const cleanPay = sanitizeCSVField(exp.payment_method || 'Espèces');
        const cleanDesc = sanitizeCSVField(exp.description || '');
        return [
          cleanDate,
          cleanAmount,
          cleanCat,
          cleanPay,
          cleanDesc
        ].join(';');
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `nyega_depenses_${today}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      hasExportedAny = true;
    }

    // Inclusion des mouvements de caisse dans l'export des données
    const caisseExported = await exportCaisseCSV();
    if (caisseExported) {
      hasExportedAny = true;
    }

    if (!hasExportedAny) {
      showToast('Aucune donnée (dépense ou caisse) à exporter.');
    } else {
      showToast('Export des données téléchargé avec succès !');
    }
  }

  async function handleDeleteAccount() {
    const msg = "⚠️ ATTENTION : La suppression de votre compte est définitive et irréversible.\n\n" +
      "Toutes vos dépenses, vos budgets, vos mouvements de caisse, vos règles personnalisées et votre profil seront définitivement effacés conformément à la Loi 2019-014.\n\n" +
      "Voulez-vous vraiment continuer ?";
    if (!confirm(msg)) return;

    const confirmation = prompt("Pour confirmer définitivement la suppression, tapez 'SUPPRIMER' en lettres majuscules :");
    if (confirmation !== 'SUPPRIMER') {
      showToast('Suppression annulée.');
      return;
    }

    try {
      showToast('Suppression de vos données en cours...');
      await NyegaDB.deleteAccount();
      alert('Votre compte et l\'intégralité de vos données ont été définitivement supprimés.');
      window.location.href = 'auth.html';
    } catch (err) {
      showToast(err.message || 'Suppression impossible, réessaie');
    }
  }

  // Exposition globale des méthodes
  window.navigateToScreen = navigateToScreen;
  window.setQuickAmount = setQuickAmount;
  window.onDescriptionInputChange = onDescriptionInputChange;
  window.open1TapCategoryPicker = open1TapCategoryPicker;
  window.close1TapCategoryPicker = close1TapCategoryPicker;
  window.select1TapCategory = select1TapCategory;
  window.handleCreateExpense = handleCreateExpense;
  window.loadHistoryExpenses = loadHistoryExpenses;
  window.handleSaveBudget = handleSaveBudget;
  window.handleProposeNextPeriodBudget = handleProposeNextPeriodBudget;
  window.handleLogout = handleLogout;
  window.showToast = showToast;
  window.openInitialBudgetModal = openInitialBudgetModal;
  window.closeInitialBudgetModal = closeInitialBudgetModal;
  window.setModalQuickBudget = setModalQuickBudget;
  window.handleInitialModalBudgetSubmit = handleInitialModalBudgetSubmit;
  window.openConfigModal = openConfigModal;
  window.closeConfigModal = closeConfigModal;
  window.handleSaveConfig = handleSaveConfig;
  window.exportExpensesCSV = exportExpensesCSV;
  window.exportCaisseCSV = exportCaisseCSV;
  window.handleDeleteAccount = handleDeleteAccount;
  window.renderCaisseCard = renderCaisseCard;
  window.renderHistoryClosedBudgets = renderHistoryClosedBudgets;

})(window);
