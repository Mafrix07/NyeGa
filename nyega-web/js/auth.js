/**
 * NYEGA - Logique d'Authentification (Supabase Auth)
 */

document.addEventListener('DOMContentLoaded', async function() {
  // Détection du retour d'un lien de réinitialisation de mot de passe Supabase
  const hash = window.location.hash || '';
  if (hash.includes('type=recovery') || hash.includes('access_token=') || hash.includes('reset-password')) {
    switchAuthTab('new-password');
    return;
  }

  // Vérifie si l'utilisateur est déjà connecté
  try {
    const session = await NyegaDB.getSession();
    if (session && session.user) {
      window.location.href = 'index.html';
      return;
    }
  } catch (e) {
    console.log('Non connecté');
  }

  // Pré-remplir les champs de config si déjà configurés
  if (window.NYEGA_CONFIG.SUPABASE_URL) {
    const cfgUrl = document.getElementById('cfgUrl');
    if (cfgUrl) cfgUrl.value = window.NYEGA_CONFIG.SUPABASE_URL;
  }
  if (window.NYEGA_CONFIG.SUPABASE_ANON_KEY) {
    const cfgKey = document.getElementById('cfgAnonKey');
    if (cfgKey) cfgKey.value = window.NYEGA_CONFIG.SUPABASE_ANON_KEY;
  }
});

function showAlert(message, type = 'danger') {
  const alertEl = document.getElementById('authAlert');
  const textEl = document.getElementById('authAlertText');
  alertEl.className = 'ny-alert ny-alert-' + type;
  textEl.textContent = message;
  alertEl.style.display = 'flex';
}

function hideAlert() {
  const alertEl = document.getElementById('authAlert');
  alertEl.style.display = 'none';
}

function switchAuthTab(tab) {
  hideAlert();
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const formLogin = document.getElementById('formLogin');
  const formRegister = document.getElementById('formRegister');
  const formReset = document.getElementById('formResetPassword');
  const formNew = document.getElementById('formNewPassword');
  const tabs = document.querySelector('.ny-auth-tabs');

  if (tab === 'login') {
    if (tabs) tabs.style.display = 'flex';
    if (tabLogin) tabLogin.classList.add('active');
    if (tabRegister) tabRegister.classList.remove('active');
    if (formLogin) formLogin.style.display = 'block';
    if (formRegister) formRegister.style.display = 'none';
    if (formReset) formReset.style.display = 'none';
    if (formNew) formNew.style.display = 'none';
  } else if (tab === 'register') {
    if (tabs) tabs.style.display = 'flex';
    if (tabRegister) tabRegister.classList.add('active');
    if (tabLogin) tabLogin.classList.remove('active');
    if (formRegister) formRegister.style.display = 'block';
    if (formLogin) formLogin.style.display = 'none';
    if (formReset) formReset.style.display = 'none';
    if (formNew) formNew.style.display = 'none';
  } else if (tab === 'reset') {
    if (tabs) tabs.style.display = 'none';
    if (formReset) formReset.style.display = 'block';
    if (formLogin) formLogin.style.display = 'none';
    if (formRegister) formRegister.style.display = 'none';
    if (formNew) formNew.style.display = 'none';
  } else if (tab === 'new-password') {
    if (tabs) tabs.style.display = 'none';
    if (formNew) formNew.style.display = 'block';
    if (formLogin) formLogin.style.display = 'none';
    if (formRegister) formRegister.style.display = 'none';
    if (formReset) formReset.style.display = 'none';
  }
}

function setBtnLoading(btnId, isLoading) {
  const btn = document.getElementById(btnId);
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

// Formatage sécurisé des erreurs Supabase sans divulgation d'existence d'email (Anti-enumeration)
function formatAuthError(error) {
  const msg = error ? (error.message || error.toString()) : '';

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe.';
  }
  if (msg.includes('User already registered') || msg.includes('already exists') || msg.includes('Email already in use')) {
    return 'Impossible de créer un compte avec ces informations. Si vous possédez déjà un compte, veuillez vous connecter ou demander la réinitialisation de votre mot de passe.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Le mot de passe doit comporter au moins 8 caractères.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Veuillez confirmer votre adresse email via le lien reçu avant de vous connecter.';
  }
  if (msg.includes('rate limit') || msg.includes('Too many requests')) {
    return 'Trop de tentatives rapprochées. Veuillez patienter un instant avant de réessayer.';
  }
  return 'Une erreur est survenue lors de l\'authentification. Veuillez réessayer.';
}

async function handleLogin(event) {
  event.preventDefault();
  hideAlert();

  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showAlert('Veuillez renseigner tous les champs.');
    return;
  }

  setBtnLoading('btnLoginSubmit', true);

  try {
    const data = await NyegaDB.signIn(email, password);
    showAlert('Connexion réussie ! Redirection en cours...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  } catch (err) {
    console.error('Erreur de connexion:', err);
    showAlert(formatAuthError(err), 'danger');
  } finally {
    setBtnLoading('btnLoginSubmit', false);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  hideAlert();

  const fullName = document.getElementById('regFullName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value;
  const passwordConfirm = document.getElementById('regPasswordConfirm').value;

  if (!fullName || !email || !password) {
    showAlert('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  if (password.length < 8) {
    showAlert('Le mot de passe doit comporter au moins 8 caractères.');
    return;
  }

  if (password !== passwordConfirm) {
    showAlert('Les mots de passe ne correspondent pas.');
    return;
  }

  setBtnLoading('btnRegisterSubmit', true);

  try {
    const data = await NyegaDB.signUp(email, password, fullName);
    showAlert('Compte créé avec succès ! Définissez maintenant votre budget pour le mois.', 'success');

    // Affichage de l'écran demandant le budget mensuel à l'étudiant
    setTimeout(() => {
      showOnboardingBudgetScreen();
    }, 400);

  } catch (err) {
    console.error('Erreur inscription:', err);
    showAlert(formatAuthError(err), 'danger');
  } finally {
    setBtnLoading('btnRegisterSubmit', false);
  }
}

async function handleRequestPasswordReset(event) {
  event.preventDefault();
  hideAlert();

  const emailInput = document.getElementById('resetEmail');
  const email = emailInput ? emailInput.value.trim() : '';

  if (!email) {
    showAlert('Veuillez renseigner votre adresse email.');
    return;
  }

  setBtnLoading('btnResetPasswordSubmit', true);

  try {
    await NyegaDB.resetPasswordForEmail(email);
    // Message neutre qui ne divulgue pas si l'email existe en base
    showAlert('Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation sous peu.', 'success');
  } catch (err) {
    showAlert('Si un compte correspond à cette adresse, vous recevrez un lien de réinitialisation sous peu.', 'success');
  } finally {
    setBtnLoading('btnResetPasswordSubmit', false);
  }
}

async function handleUpdateNewPassword(event) {
  event.preventDefault();
  hideAlert();

  const newPassword = document.getElementById('newPassword').value;
  const newPasswordConfirm = document.getElementById('newPasswordConfirm').value;

  if (!newPassword || newPassword.length < 8) {
    showAlert('Le mot de passe doit comporter au moins 8 caractères.');
    return;
  }

  if (newPassword !== newPasswordConfirm) {
    showAlert('Les mots de passe ne correspondent pas.');
    return;
  }

  setBtnLoading('btnNewPasswordSubmit', true);

  try {
    await NyegaDB.updateUserPassword(newPassword);
    showAlert('Votre mot de passe a été mis à jour avec succès ! Redirection...', 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 800);
  } catch (err) {
    showAlert('Erreur lors de la mise à jour : ' + (err.message || 'Veuillez refaire une demande de réinitialisation.'), 'danger');
  } finally {
    setBtnLoading('btnNewPasswordSubmit', false);
  }
}

function showOnboardingBudgetScreen() {
  document.getElementById('formRegister').style.display = 'none';
  document.getElementById('formLogin').style.display = 'none';
  const tabs = document.querySelector('.ny-auth-tabs');
  if (tabs) tabs.style.display = 'none';

  const screenBudget = document.getElementById('screenOnboardingBudget');
  if (screenBudget) {
    screenBudget.style.display = 'block';
    const input = document.getElementById('onboardingBudgetAmount');
    if (input) {
      input.value = '';
      input.focus();
    }
  }
}

function setOnboardingBudget(amount) {
  const input = document.getElementById('onboardingBudgetAmount');
  if (input) {
    input.value = amount;
    input.focus();
  }
}

async function handleSaveInitialBudget(event) {
  event.preventDefault();
  hideAlert();

  const amountInput = document.getElementById('onboardingBudgetAmount');
  const amount = Math.round(parseFloat(amountInput?.value || 0));

  if (!amount || amount <= 0) {
    showAlert('Veuillez saisir un montant de budget valide en FCFA.', 'danger');
    return;
  }

  setBtnLoading('btnOnboardingBudgetSubmit', true);

  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    await NyegaDB.saveBudget({
      monthly_amount: amount,
      period_start: firstDay,
      period_end: lastDay
    });

    showAlert(`Budget de ${formatFCFA(amount)} configuré avec succès ! Redirection...`, 'success');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  } catch (err) {
    showAlert('Erreur lors de la sauvegarde du budget : ' + (err.message || err), 'danger');
  } finally {
    setBtnLoading('btnOnboardingBudgetSubmit', false);
  }
}

window.setOnboardingBudget = setOnboardingBudget;
window.handleSaveInitialBudget = handleSaveInitialBudget;

// Gestion de la modale de configuration Supabase
function openConfigModal() {
  document.getElementById('configModal').style.display = 'flex';
}

function closeConfigModal() {
  document.getElementById('configModal').style.display = 'none';
}

function handleSaveConfig(event) {
  event.preventDefault();
  const url = document.getElementById('cfgUrl').value.trim();
  const anonKey = document.getElementById('cfgAnonKey').value.trim();

  window.NYEGA_CONFIG.saveConfig(url, anonKey);
  NyegaDB.reconnect();
  closeConfigModal();
  showAlert('Configuration Supabase enregistrée avec succès !', 'success');
}

window.switchAuthTab = switchAuthTab;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;
window.handleRequestPasswordReset = handleRequestPasswordReset;
window.handleUpdateNewPassword = handleUpdateNewPassword;
window.openConfigModal = openConfigModal;
window.closeConfigModal = closeConfigModal;
window.handleSaveConfig = handleSaveConfig;
