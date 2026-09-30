# NyeGa Web Application

Dossier autonome de l'application web NyeGa.

### Lancement rapide :
```bash
npx serve -l 3000
```
ou
```bash
python -m http.server 3000
```
Ouvrez ensuite `http://localhost:3000`.

Pour la documentation complète, consultez le fichier `../README.md`.

### Modèle IA (Catégorisation automatique) :
Le modèle actif par défaut est **`gemini-3.1-flash-lite`** (configurable via la variable `GEMINI_MODEL` dans Supabase Edge Functions).
> **Note :** Vérifier régulièrement la page des dépréciations Gemini, les modèles sont retirés sans préavis long (ex: `gemini-2.0-flash-lite` arrêté depuis le 1er juin 2026).

