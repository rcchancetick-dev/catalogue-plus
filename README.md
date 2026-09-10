# Catalogue+ — Catalogue numerique de bibliotheque par QR Code

Mini-projet realise par des etudiants de 2eme annee de l'Ecole Superieure Polytechnique d'Antsiranana (ESPA), Madagascar.

Catalogue+ permet a un etudiant de scanner le QR code colle sur un livre physique de la bibliotheque pour acceder instantanement a sa fiche numerique (titre, auteur, disponibilite, description) et demander un emprunt en ligne. Les administrateurs valident ou refusent les demandes depuis un tableau de bord securise.

## Fonctionnalites

**Cote utilisateur**
- Scan du QR code -> fiche livre complete (titre, auteur, ISBN, editeur, categorie, description, disponibilite)
- Inscription (nom, prenom, numero, email, etablissement, niveau, mot de passe)
- Connexion / deconnexion securisee (JWT + cookies HttpOnly)
- Demande d'emprunt avec duree personnalisable (7/14/21/30 jours)
- Suivi de ses emprunts (en attente, en cours, refuse, rendu) avec motif de refus si applicable

**Cote administrateur (acces cache et securise)**
- Acces cache : 5 clics rapides sur le coin superieur droit de la page d'accueil ouvrent /admin/connexion
- Connexion protegee par email + mot de passe + code d'acces secret (variable d'environnement)
- Tableau de bord avec statistiques completes
- Gestion des livres avec generation automatique de QR code (imprimable)
- Gestion des demandes d'emprunt (validation/refus avec motif)
- Gestion des administrateurs (super-admin peut ajouter/desactiver)
- Export Excel et PDF (livres, emprunts, utilisateurs)

**Mode hors-ligne**
- PWA avec Service Worker (cache du catalogue)
- Page offline.html si aucune connexion
- Serveur de secours local (offline-server/) pour le PC de la bibliotheque, avec sa propre interface web et sa propre base SQLite
- Synchronisation automatique vers Neon des que la connexion Internet revient

## Stack technique

- Frontend: Next.js 14 (React 18), Framer Motion
- Backend: API Routes Next.js
- Base de donnees: PostgreSQL via Neon
- Auth: JWT + bcrypt, cookies HttpOnly
- QR Code: librairie qrcode
- Export: exceljs + pdfkit
- Offline: Node.js + Express + SQLite

## Deploiement Vercel

1. Creez une base Neon Postgres via Vercel Storage
2. Importez ce repo sur vercel.com/new
3. Ajoutez les variables d'environnement: DATABASE_URL, JWT_SECRET, ADMIN_SETUP_CODE, ADMIN_ACCESS_CODE, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_LIBRARY_NAME, SYNC_SECRET
4. Deployez
5. En local: npm install puis npm run db:init puis npm run db:seed
6. Lancez aussi `node scripts/migrate-sync-columns.js` une fois (ajoute les colonnes necessaires a la synchronisation offline)
7. Admin par defaut: admin@espa.mg / Admin@2026 (a changer)
8. Acces admin: 5 clics coin superieur droit de la home, ou /admin/connexion directement

## Mode hors-ligne (serveur de secours bibliotheque)

### Demarrage rapide

```bash
cd offline-server
npm install
cp .env.example .env
npm run init-data
npm start
```

Le serveur ecoute sur http://localhost:3500 et sert sa propre interface (offline-server/public/index.html), qui consomme directement les routes API du serveur local (catalogue, emprunts, connexion, administration). Rendez-le accessible sur le Wi-Fi local de la bibliotheque (meme sans internet) pour que les etudiants continuent a consulter le catalogue et emprunter en cas de coupure.

Sous Windows, utilisez `demarrer-mode-local.bat` (menu interactif). Sous Mac/Linux, utilisez `demarrer-mode-local.sh` :

```bash
chmod +x demarrer-mode-local.sh
./demarrer-mode-local.sh
```

### Synchronisation avec le site en ligne

Chaque utilisateur et chaque emprunt cree en mode hors-ligne recoit un identifiant unique local (`local_uid`), et un indicateur `synced` (0 = pas encore transmis a Neon, 1 = confirme en ligne). Cela permet de relancer la synchronisation sans jamais creer de doublons.

- Le serveur offline verifie automatiquement toutes les 2 minutes s'il peut joindre `NEXT_PUBLIC_SITE_URL/api/ping`. Des qu'Internet revient et qu'il reste des donnees non synchronisees, il envoie automatiquement :
  - les nouveaux comptes utilisateurs vers `POST /api/sync/users`
  - les nouvelles demandes d'emprunt vers `POST /api/sync/loans`
- Chaque route de synchronisation cote Next.js verifie l'en-tete `x-sync-secret` (doit correspondre a `SYNC_SECRET`, defini a la fois dans `.env` (racine) et `offline-server/.env`).
- Un bouton **Synchroniser maintenant** est disponible dans l'interface admin du serveur offline (`http://localhost:3500`, onglet Admin) pour forcer une synchronisation immediate sans attendre la verification automatique.
- L'etat de synchronisation (en ligne/hors ligne, nombre d'enregistrements en attente) est visible en temps reel dans l'en-tete de l'interface offline via `GET /api/sync/status`.

Avant la premiere synchronisation, executez une fois `node scripts/migrate-sync-columns.js` a la racine du projet (avec `DATABASE_URL` configure) pour ajouter les colonnes `local_uid` et `synced` aux tables `users` et `loans` sur Neon.

## Securite

- Bcrypt pour les mots de passe
- JWT + cookies HttpOnly
- Triple facteur admin: email + mdp + code secret
- Acces admin invisible sur le site public
- Route /admin/setup desactivee des qu'un admin existe
- Synchronisation offline protegee par une cle partagee (SYNC_SECRET), jamais exposee au navigateur

---

*Projet academique - Ecole Superieure Polytechnique d'Antsiranana, 2eme annee, 2026.*
