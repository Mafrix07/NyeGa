/**
 * NYEGA - Supabase Client & Data Layer
 * Cible : Étudiants togolais — Devise : FCFA
 * Intègre la catégorisation automatique en 4 étapes et la table category_rules
 */

(function(window) {
  'use strict';

  // Formatage monétaire officiel en FCFA (sans centimes, avec séparateur d'espaces)
  function formatFCFA(amount) {
    const num = Math.round(Number(amount) || 0);
    return new Intl.NumberFormat('fr-FR').format(num) + ' FCFA';
  }

  // Les 7 Catégories Officielles NyeGa
  const DEFAULT_CATEGORIES = [
    { id: 'cat-1', name: 'Alimentation', icon: 'fa-cutlery', color: '#10B982' },
    { id: 'cat-2', name: 'Transport', icon: 'fa-motorcycle', color: '#FBB418' },
    { id: 'cat-3', name: 'Soins et beauté', icon: 'fa-heart', color: '#EC4899' },
    { id: 'cat-4', name: 'Connexion internet', icon: 'fa-wifi', color: '#2563EB' },
    { id: 'cat-5', name: 'Crédit d\'appel', icon: 'fa-phone', color: '#06B6D4' },
    { id: 'cat-6', name: 'Plaisirs', icon: 'fa-glass', color: '#8B5CF6' },
    { id: 'cat-7', name: 'Autres', icon: 'fa-tag', color: '#64748B' }
  ];

  let client = null;

  function initClient() {
    if (window.NYEGA_CONFIG && typeof window.NYEGA_CONFIG.isConfigured === 'function' && window.NYEGA_CONFIG.isConfigured() && window.supabase) {
      try {
        client = window.supabase.createClient(
          window.NYEGA_CONFIG.SUPABASE_URL,
          window.NYEGA_CONFIG.SUPABASE_ANON_KEY
        );
        console.log('✅ Supabase Client initialisé avec succès.');
        return client;
      } catch (err) {
        console.error('Erreur initialisation Supabase:', err);
      }
    }
    return null;
  }

  initClient();

  // Nettoyage de tout résidu de dépenses locales
  try {
    localStorage.removeItem('nyega_demo_expenses_fcfa');
  } catch (e) {}

  // Stockage local de secours (uniquement pour règles et cache budget)
  // Strictement AUCUN stockage local de secours pour les dépenses
  const LocalStore = {
    getBudget: function() {
      const data = localStorage.getItem('nyega_demo_budget_fcfa');
      return data ? JSON.parse(data) : null;
    },
    saveBudget: function(budget) {
      localStorage.setItem('nyega_demo_budget_fcfa', JSON.stringify(budget));
    },
    getUserRules: function() {
      const data = localStorage.getItem('nyega_user_rules');
      return data ? JSON.parse(data) : [];
    },
    saveUserRule: function(keyword, category_name) {
      const rules = this.getUserRules();
      const existingIdx = rules.findIndex(r => r.keyword.toLowerCase() === keyword.toLowerCase());
      if (existingIdx !== -1) {
        rules[existingIdx].category_name = category_name;
      } else {
        rules.unshift({ keyword, category_name, created_at: new Date().toISOString() });
      }
      localStorage.setItem('nyega_user_rules', JSON.stringify(rules));
      return rules;
    }
  };

  const NyegaDB = {
    isLive: function() {
      return Boolean(client && window.NYEGA_CONFIG.isConfigured());
    },

    reconnect: function() {
      return initClient();
    },

    // -------------------------------------------------------------
    // AUTHENTIFICATION SUPABASE
    // -------------------------------------------------------------
    signUp: async function(email, password, fullName) {
      if (this.isLive()) {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: { full_name: fullName.trim() }
          }
        });
        if (error) throw error;
        return data;
      } else {
        const demoUser = {
          id: 'demo-user-123',
          email: email.trim(),
          user_metadata: { full_name: fullName.trim() }
        };
        localStorage.setItem('nyega_demo_user', JSON.stringify(demoUser));
        return { user: demoUser };
      }
    },

    signIn: async function(email, password) {
      if (this.isLive()) {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: password
        });
        if (error) throw error;
        return data;
      } else {
        const demoUser = {
          id: 'demo-user-123',
          email: email.trim(),
          user_metadata: { full_name: email.split('@')[0] }
        };
        localStorage.setItem('nyega_demo_user', JSON.stringify(demoUser));
        return { user: demoUser };
      }
    },

    signOut: async function() {
      if (this.isLive()) {
        try {
          await client.auth.signOut();
        } catch (error) {
          console.error('Erreur déconnexion Supabase:', error);
        }
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      return true;
    },

    resetPasswordForEmail: async function(email) {
      if (this.isLive()) {
        const redirectUrl = window.location.origin + window.location.pathname;
        const { data, error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl
        });
        if (error) throw error;
        return data;
      } else {
        return { success: true };
      }
    },

    updateUserPassword: async function(newPassword) {
      if (this.isLive()) {
        const { data, error } = await client.auth.updateUser({
          password: newPassword
        });
        if (error) throw error;
        return data;
      } else {
        return { success: true };
      }
    },

    deleteAccount: async function() {
      if (this.isLive()) {
        const user = await this.getUser();
        if (!user) throw new Error('Utilisateur non connecté');

        // Tentative d'utilisation de la procédure atomique delete_user_account()
        try {
          const { error: rpcErr } = await client.rpc('delete_user_account');
          if (!rpcErr) {
            await client.auth.signOut();
            try { localStorage.clear(); sessionStorage.clear(); } catch(e){}
            return true;
          }
        } catch(e) {}

        // Fallback suppression séquentielle sous RLS
        await client.from('expenses').delete().eq('user_id', user.id);
        await client.from('budgets').delete().eq('user_id', user.id);
        await client.from('category_rules').delete().eq('user_id', user.id);
        await client.from('profiles').delete().eq('id', user.id);
        await client.auth.signOut();
      }
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {}
      return true;
    },

    getUser: async function() {
      if (this.isLive()) {
        const { data: { user } } = await client.auth.getUser();
        return user;
      }
      const demo = localStorage.getItem('nyega_demo_user');
      return demo ? JSON.parse(demo) : null;
    },

    getSession: async function() {
      if (this.isLive()) {
        const { data: { session } } = await client.auth.getSession();
        return session;
      }
      const user = await this.getUser();
      return user ? { user: user } : null;
    },

    // -------------------------------------------------------------
    // CATÉGORIES
    // -------------------------------------------------------------
    getCategories: async function() {
      if (this.isLive()) {
        try {
          const { data, error } = await client
            .from('categories')
            .select('*')
            .order('name');
          if (error) throw error;
          if (data && data.length > 0) return data;
        } catch (e) {
          console.warn('Utilisation catégories locales suite à:', e.message);
        }
      }
      return DEFAULT_CATEGORIES;
    },

    // -------------------------------------------------------------
    // MÉMOIRE UTILISATEUR : category_rules
    // -------------------------------------------------------------
    getUserRules: async function() {
      if (this.isLive()) {
        try {
          const user = await this.getUser();
          if (user) {
            const { data, error } = await client
              .from('category_rules')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
          }
        } catch (e) {
          console.warn('Erreur lecture category_rules:', e.message);
        }
      }
      return LocalStore.getUserRules();
    },

    saveUserRule: async function(keyword, categoryName) {
      if (!keyword || !categoryName) return;
      const cleanKw = keyword.trim().toLowerCase();

      if (this.isLive()) {
        try {
          const user = await this.getUser();
          if (user) {
            const { error } = await client
              .from('category_rules')
              .upsert(
                {
                  user_id: user.id,
                  keyword: cleanKw,
                  category_name: categoryName
                },
                { onConflict: 'user_id,keyword' }
              );
            if (error) throw error;
          }
        } catch (e) {
          console.warn('Erreur sauvegarde category_rules:', e.message);
        }
      }
      LocalStore.saveUserRule(cleanKw, categoryName);
    },

    // -------------------------------------------------------------
    // PIPELINE DE CATÉGORISATION AUTOMATIQUE EN 4 ÉTAPES
    // -------------------------------------------------------------
    categorizeExpense: async function(description) {
      if (!description || !description.trim()) {
        return { category: 'Autres', confidence: 0.0, source: 'default' };
      }

      // ÉTAPE 1 : Mémoire utilisateur (category_rules)
      // ÉTAPE 2 : Mots-clés locaux (dictionnaire togolais)
      const userRules = await this.getUserRules();
      const localMatch = window.resolveCategoryLocal(description, userRules);

      if (localMatch) {
        console.log(`🎯 Match local trouvé (${localMatch.source}) pour "${description}" -> ${localMatch.category}`);
        return localMatch;
      }

      // ÉTAPE 3 : Appel IA (Gemini Flash-Lite via Supabase Edge Function)
      if (this.isLive()) {
        console.log(`🤖 Appel Supabase Edge Function pour "${description}"...`);
        try {
          // Timeout client de 4 secondes
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout IA 4s dépassé')), 4000)
          );

          const edgeCallPromise = client.functions.invoke('categorize-expense', {
            body: { description: description.slice(0, 100).trim() }
          });

          const { data, error } = await Promise.race([edgeCallPromise, timeoutPromise]);

          if (error) {
            console.warn('Erreur Edge Function:', error.message);
            // ÉTAPE 4 : Fallback vers Autres sans bloquer
            return { category: 'Autres', confidence: 0.0, source: 'fallback' };
          }

          if (data && data.category) {
            // Si confiance < 0.6 -> repli vers Autres
            if (typeof data.confidence === 'number' && data.confidence < 0.6) {
              return { category: 'Autres', confidence: data.confidence, source: 'low_confidence' };
            }
            return {
              category: data.category,
              confidence: data.confidence || 0.8,
              source: data.source || 'ai'
            };
          }
        } catch (err) {
          console.warn('Erreur ou timeout lors de l\'appel IA:', err.message);
        }
      }

      // ÉTAPE 4 : Fallback sécurisé vers "Autres" sans bloquer l'enregistrement
      return { category: 'Autres', confidence: 0.0, source: 'fallback' };
    },

    // -------------------------------------------------------------
    // BUDGET (FCFA)
    // -------------------------------------------------------------
    getBudget: async function() {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      if (this.isLive()) {
        try {
          const user = await this.getUser();
          if (user) {
            const { data, error } = await client
              .from('budgets')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (error) throw error;
            if (data && data.length > 0) {
              return data[0];
            } else {
              return null; // Aucun budget défini pour le moment
            }
          }
        } catch (e) {
          console.warn('Erreur budget Supabase:', e.message);
        }
      }
      return LocalStore.getBudget();
    },

    saveBudget: async function(budgetData) {
      if (this.isLive()) {
        const user = await this.getUser();
        if (user) {
          const payload = {
            user_id: user.id,
            monthly_amount: Math.round(parseFloat(budgetData.monthly_amount)),
            period_start: budgetData.period_start,
            period_end: budgetData.period_end,
            updated_at: new Date().toISOString()
          };

          const { data: existing } = await client
            .from('budgets')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

          if (existing && existing.length > 0) {
            const { data, error } = await client
              .from('budgets')
              .update(payload)
              .eq('id', existing[0].id)
              .select();
            if (error) throw error;
            return data[0];
          } else {
            const { data, error } = await client
              .from('budgets')
              .insert([payload])
              .select();
            if (error) throw error;
            return data[0];
          }
        }
      }
      LocalStore.saveBudget(budgetData);
      return budgetData;
    },

    // -------------------------------------------------------------
    // DÉPENSES (EXPENSES EN FCFA)
    // -------------------------------------------------------------
    getExpenses: async function(filters = {}) {
      if (!this.isLive()) {
        throw new Error('Connexion à Supabase impossible : le serveur est injoignable. Vos dépenses ne peuvent pas être chargées.');
      }

      const user = await this.getUser();
      if (!user) {
        return [];
      }

      let query = client
        .from('expenses')
        .select('*, categories(*)')
        .eq('user_id', user.id);

      if (filters.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters.sortBy === 'amount') {
        query = query.order('amount', { ascending: filters.order === 'asc' });
      } else {
        query = query.order('expense_date', { ascending: filters.order === 'asc' });
      }

      const { data, error } = await query;
      if (error) {
        console.error('Erreur chargement dépenses Supabase:', error);
        throw new Error('Impossible de charger vos dépenses : le serveur Supabase est injoignable.');
      }
      return data || [];
    },

    addExpense: async function(expenseData) {
      if (!this.isLive()) {
        throw new Error("Impossible d'enregistrer la dépense : le serveur Supabase est injoignable. Votre dépense n'a pas été enregistrée.");
      }

      const user = await this.getUser();
      if (!user) {
        throw new Error("Session invalide ou expirée. Veuillez vous reconnecter pour enregistrer votre dépense.");
      }

      const payload = {
        user_id: user.id,
        amount: Math.round(parseFloat(expenseData.amount)),
        description: expenseData.description || 'Dépense',
        category_id: expenseData.category_id || null,
        expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
        payment_method: expenseData.payment_method || 'Espèces'
      };

      const { data, error } = await client
        .from('expenses')
        .insert([payload])
        .select('*, categories(*)');

      if (error) {
        console.error('Erreur insertion dépense Supabase:', error);
        throw new Error("Échec de l'enregistrement sur Supabase (" + (error.message || 'serveur injoignable') + "). Votre dépense n'a pas été enregistrée.");
      }

      if (!data || data.length === 0) {
        throw new Error("Erreur de retour lors de l'enregistrement de la dépense.");
      }

      return data[0];
    },

    updateExpense: async function(expenseId, expenseData) {
      if (!this.isLive()) {
        throw new Error("Connexion à Supabase impossible : le serveur est injoignable. La modification n'a pas été enregistrée.");
      }

      const payload = {
        amount: Math.round(parseFloat(expenseData.amount)),
        description: expenseData.description,
        category_id: expenseData.category_id,
        expense_date: expenseData.expense_date,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await client
        .from('expenses')
        .update(payload)
        .eq('id', expenseId)
        .select('*, categories(*)');

      if (error) {
        console.error('Erreur mise à jour dépense Supabase:', error);
        throw new Error("Échec de la modification sur Supabase (" + (error.message || 'serveur injoignable') + ").");
      }

      return data?.[0] || payload;
    },

    deleteExpense: async function(expenseId) {
      if (!this.isLive()) {
        throw new Error("Connexion à Supabase impossible : le serveur est injoignable. La suppression n'a pas été effectuée.");
      }

      const { error } = await client
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) {
        console.error('Erreur suppression dépense Supabase:', error);
        throw new Error("Échec de la suppression sur Supabase (" + (error.message || 'serveur injoignable') + ").");
      }

      return true;
    }
  };

  window.formatFCFA = formatFCFA;
  window.NyegaDB = NyegaDB;
  window.DEFAULT_CATEGORIES = DEFAULT_CATEGORIES;
})(window);
