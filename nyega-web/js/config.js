/**
 * NYEGA - Configuration Supabase
 *
 * Vous pouvez renseigner vos clés ici, ou les saisir directement dans
 * l'interface via le bouton "⚙️ Configuration Supabase" si vous préférez
 * ne pas modifier ce fichier.
 */

window.NYEGA_CONFIG = {
  // Remplacez ces valeurs par vos vraies clés Supabase
  // ou laissez vide pour utiliser la saisie interactive
  SUPABASE_URL: window.localStorage.getItem('NYEGA_SUPABASE_URL') || '',
  SUPABASE_ANON_KEY: window.localStorage.getItem('NYEGA_SUPABASE_ANON_KEY') || '',

  // Vérifie si Supabase est correctement configuré
  isConfigured: function() {
    return (
      Boolean(this.SUPABASE_URL) &&
      this.SUPABASE_URL.startsWith('http') &&
      Boolean(this.SUPABASE_ANON_KEY) &&
      this.SUPABASE_ANON_KEY.length > 20
    );
  },

  // Permet de mettre à jour les clés dans le navigateur
  saveConfig: function(url, anonKey) {
    if (url) {
      window.localStorage.setItem('NYEGA_SUPABASE_URL', url.trim());
      this.SUPABASE_URL = url.trim();
    }
    if (anonKey) {
      window.localStorage.setItem('NYEGA_SUPABASE_ANON_KEY', anonKey.trim());
      this.SUPABASE_ANON_KEY = anonKey.trim();
    }
  },

  // Réinitialiser la configuration
  resetConfig: function() {
    window.localStorage.removeItem('NYEGA_SUPABASE_URL');
    window.localStorage.removeItem('NYEGA_SUPABASE_ANON_KEY');
    this.SUPABASE_URL = '';
    this.SUPABASE_ANON_KEY = '';
  }
};
