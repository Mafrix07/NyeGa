/**
 * NYEGA - Configuration Supabase
 *
 * En production, la clé anon publique et l'URL Supabase sont définies directement ici.
 * Les boutons de configuration interactifs sont masqués hors mode développement.
 */

window.NYEGA_CONFIG = {
  // Clés publiques Supabase (Anon Key - utilisable côté client en production)
  // Renseignez ici l'URL et la clé anonyme de votre projet Supabase
  SUPABASE_URL: 'https://votre-projet.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_cle_anon_ici',

  // Détection du mode développement : actif uniquement en local (localhost / 127.0.0.1 / file://) ou via ?dev=true
  isDevMode: function() {
    try {
      const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname) || window.location.protocol === 'file:';
      const hasDevParam = new URLSearchParams(window.location.search).get('dev') === 'true';
      const hasDevStorage = window.localStorage.getItem('NYEGA_DEV_MODE') === 'true';
      return Boolean(isLocal || hasDevParam || hasDevStorage);
    } catch {
      return false;
    }
  },

  // Vérifie si Supabase est correctement configuré
  isConfigured: function() {
    return (
      Boolean(this.SUPABASE_URL) &&
      this.SUPABASE_URL.startsWith('http') &&
      !this.SUPABASE_URL.includes('votre-projet.supabase.co') &&
      Boolean(this.SUPABASE_ANON_KEY) &&
      this.SUPABASE_ANON_KEY.length > 20 &&
      !this.SUPABASE_ANON_KEY.includes('votre_cle_anon_ici')
    );
  },

  // Permet de mettre à jour les clés dans le navigateur (en mode développement uniquement)
  saveConfig: function(url, anonKey) {
    if (!this.isDevMode()) return;
    if (url) {
      window.localStorage.setItem('NYEGA_SUPABASE_URL', url.trim());
      this.SUPABASE_URL = url.trim();
    }
    if (anonKey) {
      window.localStorage.setItem('NYEGA_SUPABASE_ANON_KEY', anonKey.trim());
      this.SUPABASE_ANON_KEY = anonKey.trim();
    }
  },

  // Réinitialiser la configuration (mode dev)
  resetConfig: function() {
    if (!this.isDevMode()) return;
    window.localStorage.removeItem('NYEGA_SUPABASE_URL');
    window.localStorage.removeItem('NYEGA_SUPABASE_ANON_KEY');
  }
};

// En mode développement, possibilité de charger des clés locales de test
if (window.NYEGA_CONFIG.isDevMode()) {
  const localUrl = window.localStorage.getItem('NYEGA_SUPABASE_URL');
  const localKey = window.localStorage.getItem('NYEGA_SUPABASE_ANON_KEY');
  if (localUrl) window.NYEGA_CONFIG.SUPABASE_URL = localUrl;
  if (localKey) window.NYEGA_CONFIG.SUPABASE_ANON_KEY = localKey;
}
