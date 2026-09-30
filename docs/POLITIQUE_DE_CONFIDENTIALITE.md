# POLITIQUE DE CONFIDENTIALITÉ — APPLICATION NYEGA
**Conforme à la Loi n° 2019-014 du 29 octobre 2019 relative à la protection des données à caractère personnel en République Togolaise**

*Dernière mise à jour : [À COMPLÉTER : Date ex: 30 septembre 2026]*

---

## 1. IDENTITÉ ET COORDONNÉES DU RESPONSABLE DU TRAITEMENT

L'application web et mobile **NyeGa** (ci-après « l'Application » ou « NyeGa ») est éditée et exploitée sous la responsabilité de :

- **Responsable du traitement / Éditeur :** [À COMPLÉTER : Nom de l'organisme, entreprise ou nom du fondateur]
- **Statut juridique :** [À COMPLÉTER : ex. Entreprise individuelle / Société SAS / Association / Projet étudiant]
- **Siège social / Adresse :** [À COMPLÉTER : ex. Lomé, Quartier Tokoin / Université de Lomé, Togo]
- **Immatriculation RCCM / Numéro légal :** [À COMPLÉTER : Numéro RCCM TG-LOM-... ou N/A]
- **Contact DPO (Délégué à la Protection des Données) :** [À COMPLÉTER : email ex: dpo@nyega.tg ou contact@nyega.tg]
- **Téléphone :** [À COMPLÉTER : ex: +228 90 00 00 00]
- **Déclaration IPDCP :** Déclaration de conformité enregistrée ou en cours d'enregistrement auprès de l'**Instance de Protection des Données à Caractère Personnel (IPDCP)** du Togo sous le récépissé n° [À COMPLÉTER : N° de récépissé IPDCP ou "En cours d'attribution"].

---

## 2. CHAMP D'APPLICATION ET ENGAGEMENT

La présente Politique de confidentialité a pour objet d'informer tout utilisateur (notamment les étudiants et jeunes actifs au Togo) de la manière dont leurs données à caractère personnel sont collectées, traitées, sécurisées et conservées conformément aux dispositions de la **Loi togolaise n° 2019-014 du 29 octobre 2019**.

NyeGa s'engage à respecter le principe de **minimisation des données** : nous ne collectons que les informations strictement nécessaires à la tenue de votre budget personnel en Francs CFA (FCFA).

---

## 3. DONNÉES PERSONNELLES COLLECTÉES

Dans le cadre du fonctionnement de l'Application, les catégories de données suivantes peuvent être collectées :

### A. Données d'identification et de compte
- **Adresse email** : utilisée comme identifiant unique de connexion et pour la récupération sécurisée du mot de passe.
- **Nom et prénom (ou pseudonyme)** : utilisé pour personnaliser l'affichage de votre tableau de bord.
- **Mot de passe** : conservé exclusivement sous forme d'empreinte cryptographique irréversible (hachage salé bcrypt/argon2 via Supabase Auth). Aucun membre de l'équipe NyeGa n'a accès à votre mot de passe en clair.

### B. Données financières et budgétaires déclaratives
- **Montant du budget mensuel alloué** (exprimé en FCFA).
- **Dépenses enregistrées** : date, montant en FCFA, intitulé libre (ex. *« zem campus », « ayimolou », « pass internet »*), catégorie attribuée, moyen de paiement indicatif (*Espèces, TMoney, Flooz, Carte*).
- **Règles d'apprentissage de catégorisation** : associations mot-clé -> catégorie mémorisées suite à vos corrections manuelles en un tap.

### C. Ce que NyeGa ne collecte JAMAIS :
- Aucun numéro de compte bancaire, code secret, numéro de carte de crédit ni code PIN Mobile Money (*TMoney* ou *Moov Flooz*).
- Aucune donnée biométrique, aucune géolocalisation GPS en continu.
- Aucun relevé bancaire automatique : toutes les dépenses sont enregistrées sur déclaration volontaire de l'étudiant.

---

## 4. FINALITÉS ET BASE LÉGALE DU TRAITEMENT

Conformément à l'article 9 de la Loi 2019-014, les données sont collectées pour des finalités explicites et légitimes :

| Finalité | Base légale (Loi 2019-014) |
| :--- | :--- |
| **Création et gestion du compte utilisateur** | Exécution du contrat d'utilisation du service |
| **Calcul du reste à vivre et du budget journalier conseillé en FCFA** | Exécution du contrat d'utilisation du service |
| **Catégorisation assistée par intelligence artificielle (Edge Function)** | Consentement explicite de l'utilisateur et intérêt légitime |
| **Sécurisation de l'infrastructure et prévention des abus (rate limit)** | Obligation de sécurité (Art. 39 Loi 2019-014) |
| **Exportation et portabilité des données** | Respect des droits des personnes concernées |

---

## 5. TRAITEMENT PAR L'INTELLIGENCE ARTIFICIELLE (EDGE FUNCTION)

Pour automatiser la catégorisation des dépenses sans friction :
- Seul l'intitulé textuel court de la dépense (limité à 100 caractères, ex. *« recharge moov data »*) est transmis de façon chiffrée (TLS 1.3) à notre micro-service backend de catégorisation.
- **Aucune information nominative** (ni nom, ni email, ni montant en FCFA, ni solde) n'est jamais transmise au modèle de langage.
- Les requêtes ne sont utilisées par aucun modèle d'IA public à des fins d'entraînement ou de profilage publicitaire.

---

## 6. DESTINATAIRES DES DONNÉES ET TRANSFERTS

Les données collectées sont strictement réservées à l'usage de NyeGa et ne font l'objet **d'aucune cession, revente ou commercialisation** à des tiers.

Sous-traitants techniques engagés sous clauses de confidentialité stricte :
- **Infrastructure de base de données et authentification :** Supabase Inc. (isolation stricte par utilisateur via *Row Level Security*).
- **Hébergement Frontend :** [À COMPLÉTER : ex. Vercel Inc. / Netlify Inc. / Serveur local hébergé au Togo].
- **Autorités légales togolaises :** uniquement sur réquisition judiciaire officielle émise par une juridiction compétente du Togo.

---

## 7. MESURES DE SÉCURITÉ TECHNIQUES ET ORGANISATIONNELLES

Conformément à l'obligation de sécurité prescrite par la Loi n° 2019-014 (Articles 39 et suivants) :
1. **Chiffrement de bout en bout :** Toutes les communications transitent sous protocole chiffré HTTPS / TLS 1.3 avec en-têtes de sécurité renforcés (*CSP, HSTS, X-Content-Type-Options, X-Frame-Options*).
2. **Isolation Row Level Security (RLS) :** Au niveau de la base de données, chaque enregistrement est verrouillé par la clé de session utilisateur `auth.uid()`. Aucun utilisateur ne peut accéder, modifier ou supprimer les données d'un autre étudiant.
3. **Mots de passe robustes :** Longueur minimale imposée de 8 caractères.
4. **Cloisonnement des secrets :** Clés de service et clés d'API isolées côté serveur, jamais exposées au client web.
5. **Nettoyage local à la déconnexion :** Toute session locale (*localStorage, sessionStorage*) est vidée lors de la déconnexion.

---

## 8. DURÉE DE CONSERVATION DES DONNÉES

- **Données de compte actif :** conservées tant que l'utilisateur maintient son compte actif sur NyeGa.
- **Inactivité prolongée :** tout compte inactif depuis plus de vingt-quatre (24) mois fera l'objet d'une notification préalable par email, puis de suppression définitive en l'absence de reconnexion.
- **Suppression volontaire :** en cas de clic sur « Supprimer mon compte », la suppression dans la base de données est **immédiate et irréversible**.

---

## 9. VOS DROITS CONFORMÉMENT À LA LOI TOGOLAISE 2019-014

En application du Chapitre IV de la Loi n° 2019-014, vous disposez des droits suivants :

1. **Droit d'accès et d'information (Articles 22-24) :** Vous pouvez consulter à tout moment l'ensemble de vos données directement dans votre interface NyeGa.
2. **Droit de rectification (Article 25) :** Vous pouvez modifier ou corriger vos montants, budgets et libellés de dépense directement dans l'application.
3. **Droit à l'effacement / Droit à l'oubli (Article 26) :** Vous disposez dans l'application du bouton « **Supprimer mon compte** », qui purge instantanément vos profils, budgets, dépenses et règles de notre base de données.
4. **Droit à la portabilité des données :** Vous pouvez à tout moment télécharger l'historique complet de vos dépenses grâce au bouton « **Exporter mes dépenses (CSV)** ».
5. **Droit d'opposition (Article 27) :** Vous pouvez vous opposer au traitement de vos données en clôturant votre compte.

---

## 10. CONTACT ET RECOURS

Pour toute question relative à cette Politique ou pour exercer vos droits :
- **Par email :** [À COMPLÉTER : contact@nyega.tg ou votre email personnel/professionnel]
- **Par courrier :** [À COMPLÉTER : Adresse postale ou boîte postale à Lomé, Togo]

Si vous estimez que vos droits n'ont pas été respectés après nous avoir contactés, vous avez le droit d'introduire une réclamation auprès de l'autorité nationale de contrôle :
- **Instance de Protection des Données à Caractère Personnel (IPDCP) de la République Togolaise**
- **Adresse :** [À COMPLÉTER : Lomé, Togo]
- **Site web officiel :** [À COMPLÉTER : http://ipdcp.tg ou coordonnées officielles de l'IPDCP]
