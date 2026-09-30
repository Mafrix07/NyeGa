# POLITIQUE DE CONFIDENTIALITÉ — NYEGA (TOGO)
**Conforme à la Loi n° 2019-014 relative à la protection des données à caractère personnel (République Togolaise)**

*Dernière mise à jour : [À COMPLÉTER : Date, ex. 1er Octobre 2026]*

---

## 1. IDENTIFICATION DU RESPONSABLE DU TRAITEMENT

L'application web et mobile-first **NyeGa** est développée et exploitée sous la responsabilité légale de :

- **Éditeur / Responsable du traitement :** [À COMPLÉTER : Nom et Prénom du porteur de projet OU Dénomination sociale de la structure]
- **Forme juridique / Statut :** [À COMPLÉTER : Entreprise Individuelle, SARL, Association, Projet d'Innovation Étudiante]
- **Siège social / Adresse :** [À COMPLÉTER : Adresse physique, Numéro de rue, Quartier, Ville, ex. Quartier Totsi / Campus de Lomé, Lomé, Togo]
- **Téléphone :** [À COMPLÉTER : Numéro de téléphone togolais, ex. +228 90 00 00 00]
- **Courrier électronique :** [À COMPLÉTER : Adresse email de contact, ex. contact@nyega.tg]
- **Délégué à la Protection des Données (DPO) / Référent Conformité :** [À COMPLÉTER : Nom et email du référent, ex. dpo@nyega.tg]
- **Déclaration IPDCP :** Déclaration enregistrée auprès de l'**Instance de Protection des Données à Caractère Personnel (IPDCP)** du Togo sous le récépissé n° [À COMPLÉTER : Numéro d'enregistrement IPDCP ou mention « Dossier de déclaration en cours d'instruction »].

---

## 2. PRINCIPES FONDAMENTAUX APPLICABLES (ARTICLE 14 À 18 DE LA LOI 2019-014)

Conformément à la législation togolaise, tout traitement de données personnelles au sein de NyeGa respecte les principes suivants :
1. **Licéité, loyauté et transparence :** Les données sont collectées uniquement avec le consentement explicite de l'étudiant.
2. **Minimisation des données (Article 16) :** Seules les données strictement nécessaires au calcul du solde budgétaire et à la catégorisation sont demandées.
3. **Exactitude :** L'étudiant peut rectifier à tout instant ses montants et descriptions.
4. **Limitation de conservation :** Les données sont conservées tant que le compte est actif, et purgées immédiatement en cas de demande de suppression.
5. **Intégrité et confidentialité :** Chiffrement de bout en bout (TLS 1.3), hashage irréversible des mots de passe, isolation étanche au niveau de la base de données via Row Level Security (RLS).

---

## 3. DONNÉES PERSONNELLES COLLECTÉES

NyeGa collecte exclusivement les données déclarées par l'étudiant :

| Catégorie | Données collectées | Finalité du traitement | Base légale (Loi 2019-014) |
|---|---|---|---|
| **Compte & Identification** | Adresse email, mot de passe chiffré (hashé en base), nom ou pseudonyme | Authentification sécurisée, accès à l'espace personnel | Consentement de l'utilisateur (Art. 15) |
| **Gestion Budgétaire** | Montant du budget alloué (FCFA), dates de cycle mensuel | Calcul du budget restant et des recommandations journalières | Exécution du service demandé |
| **Dépenses déclaratives** | Montant (FCFA), date, moyen indicatif (Espèces, TMoney, Flooz, Carte), description | Ventilation analytique, historique, détection de catégorie | Exécution du service demandé |
| **Règles personnalisées** | Mots-clés saisis et corrections apportées | Apprentissage en 1 tap des préférences de l'étudiant | Intérêt légitime d'amélioration de l'UX |

### Ce que NyeGa ne collecte JAMAIS :
- **AUCUNE coordonnée bancaire, AUCUN numéro de carte bancaire.**
- **AUCUN code secret, mot de passe ou code PIN TMoney ou Moov Flooz.**
- **AUCUNE connexion directe aux serveurs de téléphonie ou banques.**
- **AUCUNE géolocalisation GPS en temps réel.**

---

## 4. TRAITEMENT PAR INTELLIGENCE ARTIFICIELLE (EDGE FUNCTION ISOLÉE)

Pour automatiser la classification sans saisie manuelle :
1. Seule la description textuelle courte saisie (maximum 100 caractères, ex. *« 2 pains et haricots »*) est transmise à l'Edge Function.
2. **Aucune donnée nominative** (nom, email, identifiant, montant en FCFA) n'est transmise au modèle d'intelligence artificielle (Google Gemini 3.1 Flash-Lite).
3. Les données textuelles ne sont **jamais utilisées pour l'entraînement public** de modèles tiers, ni cédées ou revendues.

---

## 5. DESTINATAIRES DES DONNÉES ET TRANSFERTS

Les données sont hébergées dans un environnement cloud sécurisé géré par Supabase (chiffrement au repos AES-256, conformité ISO 27001 et SOC 2).
Aucune donnée personnelle n'est transmise à des tiers à des fins publicitaires, commerciales ou de courtage de données.

---

## 6. VOS DROITS ET MOYENS D'EXERCICE (ARTICLES 22 À 27 DE LA LOI 2019-014)

Conformément à la Loi n° 2019-014 de la République Togolaise, chaque étudiant bénéficie de droits fondamentaux inaliénables :

1. **Droit d'accès (Art. 22) :** Consultation immédiate et gratuite de l'intégralité de vos dépenses et paramètres dans l'application.
2. **Droit de rectification (Art. 24) :** Correction instantanée de toute dépense, budget ou catégorie par simple clic ou via la fenêtre d'édition.
3. **Droit à l'effacement (« Droit à l'oubli », Art. 25) :** Vous disposez dans l'écran *Budget* d'un bouton rouge **« Supprimer mon compte »**. Cette action déclenche la purge définitive, complète et irréversible de l'ensemble de vos dépenses, budgets, règles et profil utilisateur.
4. **Droit à la portabilité (Art. 26) :** Téléchargement instantané de toutes vos dépenses au format standard CSV via le bouton **« Exporter mes dépenses (CSV) »**.
5. **Droit d'opposition et de retrait du consentement (Art. 23) :** Vous pouvez révoquer votre consentement à tout moment en supprimant votre compte.

Pour toute demande écrite ou réclamation, vous pouvez contacter notre référent données :
- **Email :** [À COMPLÉTER : contact@nyega.tg]
- **Délai de réponse :** Moins de 30 jours calendaires.

En cas de contestation non résolue, vous disposez du droit légal d'introduire une réclamation auprès de l'autorité nationale togolaise :
- **Instance de Protection des Données à Caractère Personnel (IPDCP)**
- Lomé, République Togolaise.

---

## 7. NOTIFICATION EN CAS DE VIOLATION DE DONNÉES (ARTICLE 43)

En cas d'incident de sécurité entraînant une violation de données personnelles (fuite ou accès non autorisé), l'équipe NyeGa s'engage conformément à l'Article 43 de la Loi 2019-014 à notifier l'**IPDCP dans un délai maximal de 72 heures**, ainsi qu'à informer directement les étudiants concernés si un risque élevé est identifié.
