/**
 * NYEGA - Fournisseur d'IA Isolé pour la Catégorisation de Dépenses
 *
 * Ce module encapsule l'intégralité des interactions avec le modèle d'IA.
 * Pour changer de modèle ou de fournisseur (ex: OpenAI, Anthropic, Groq, Mistral),
 * il suffit de modifier cette classe ou d'implémenter l'interface AIProvider
 * sans impacter le reste du backend ni l'application web.
 */

export interface CategorizationResult {
  category: string;
  confidence: number;
  source: 'ai' | 'fallback';
}

export interface AIProvider {
  categorize(description: string, signal?: AbortSignal): Promise<CategorizationResult>;
}

export const ALLOWED_CATEGORIES = [
  'Alimentation',
  'Transport',
  'Soins et beauté',
  'Connexion internet',
  "Crédit d'appel",
  'Plaisirs',
  'Autres'
] as const;

export type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

/**
 * Fournisseur Google Gemini (Modèle Gemini 3.1 Flash-Lite configurable)
 */
export class GeminiFlashLiteProvider implements AIProvider {
  private apiKey: string;
  private modelName: string;

  /**
   * @param apiKey Clé secrète Gemini récupérée depuis Deno.env.get("GEMINI_API_KEY")
   * @param modelName Modèle utilisé (par défaut via variable d'environnement GEMINI_MODEL ou 'gemini-3.1-flash-lite')
   */
  constructor(
    apiKey?: string,
    modelName?: string
  ) {
    this.apiKey = apiKey || Deno.env.get('GEMINI_API_KEY') || '';
    this.modelName = modelName || Deno.env.get('GEMINI_MODEL') || 'gemini-3.1-flash-lite';
  }

  async categorize(description: string, signal?: AbortSignal): Promise<CategorizationResult> {
    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY non configurée. Bascule automatique vers "Autres".');
      return { category: 'Autres', confidence: 0.0, source: 'fallback' };
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const systemPrompt = `Tu es le moteur de catégorisation intelligent de l'application de budget étudiant NyeGa au Togo.
Ta mission est de classer la dépense d'un étudiant togolais dans EXACTEMENT UNE des 7 catégories suivantes :
1. "Alimentation" : nourriture, pain, riz, pâte, fufu, foufou, ayimolou, atassi, kom, djenkoumé, sauce, gboma, arachides, oeuf, resto U, sandwich, cafeteria, alloco, garba, beignets, fruits, épicerie...
2. "Transport" : zem, zémidjan, taxi, moto, bus campus, déplacement, essence, carburant, course...
3. "Soins et beauté" : gloss, tresses, mèches, savon, pommade, parfum, coiffure, coupe, défrisage, maquillage, gel douche, serviette hygiénique, manucure...
4. "Connexion internet" : forfait internet, pass nuit, data, méga, giga, wifi, cybercafé, forfait Togocom data, pass Moov data, fibre... (si la description est "forfait" seul, évalue s'il s'agit d'internet ou de crédit d'appel)
5. "Crédit d'appel" : crédit d'appel, recharge téléphone, transfert d'unités, minutes d'appel, recharge communication... (Note : TMoney et Flooz sont des moyens de paiement mobiles universels et non une catégorie)
6. "Plaisirs" : maquis, sortie entre amis, cinéma, bière, castel, cocktail, chill, plage de Lomé, piscine, chicha, concert, boîte, jeu vidéo, streaming...
7. "Autres" : toute dépense qui ne rentre pas clairement dans les 6 ci-dessus (photocopies, frais bancaires, fournitures scolaires, imprévu...).

RÈGLES IMPORTANTES :
- Ne prends en compte QUE la description textuelle fournie.
- Réponds STRICTEMENT au format JSON valide, sans aucun texte autour, sans balises markdown :
{"category": "NomExactDeLaCategorie", "confidence": 0.85}
- Si tu as un doute ou si la description est vague, choisis "Autres" avec une confiance faible (< 0.6).`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\nDescription de la dépense de l'étudiant : "${description}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 60,
        responseMimeType: 'application/json'
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: signal
      });

      // Gestion spécifique de l'erreur 429 (quota atteint)
      if (response.status === 429) {
        console.warn('⚠️ Quota Gemini atteint (HTTP 429). Bascule silencieuse vers plan B (Autres).');
        return { category: 'Autres', confidence: 0.0, source: 'fallback' };
      }

      if (!response.ok) {
        let errorMsg = '';
        try {
          const errJson = await response.json();
          errorMsg = errJson.error?.message || JSON.stringify(errJson);
        } catch {
          errorMsg = await response.text().catch(() => 'Erreur inconnue');
        }
        // Masquage strict de la clé API pour ne jamais l'exposer dans les logs
        const sanitizedMsg = errorMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '***').replace(/key=[^&\s]+/gi, 'key=***');
        console.error(`[Gemini API Failure] Code HTTP ${response.status} - Modèle ${this.modelName} - Message : ${sanitizedMsg}`);
        return { category: 'Autres', confidence: 0.0, source: 'fallback' };
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      // Nettoyer d'éventuels backticks markdown
      const cleanedJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      let category = parsed.category?.trim();
      let confidence = typeof parsed.confidence === 'number' ? parsed.confidence : 0.7;

      // Validation stricte de la catégorie côté serveur
      if (!ALLOWED_CATEGORIES.includes(category as AllowedCategory)) {
        console.warn(`Catégorie invalide retournée par l'IA ("${category}"). Reclassée en "Autres".`);
        category = 'Autres';
        confidence = 0.5;
      }

      // Si confiance < 0.6, requalification automatique en Autres
      if (confidence < 0.6) {
        category = 'Autres';
      }

      return {
        category,
        confidence: Math.min(1.0, Math.max(0.0, confidence)),
        source: 'ai'
      };

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.warn('⏱️ Timeout IA dépassé (4s). Bascule vers Autres.');
      } else {
        const errorMsg = err instanceof Error ? err.message : String(err);
        const sanitizedMsg = errorMsg.replace(/AIza[0-9A-Za-z-_]{35}/g, '***').replace(/key=[^&\s]+/gi, 'key=***');
        console.error(`[Gemini Call Error] Modèle ${this.modelName} - Exception : ${sanitizedMsg}`);
      }
      return { category: 'Autres', confidence: 0.0, source: 'fallback' };
    }
  }
}
