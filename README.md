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
- Serveur de secours local (offline-server/) pour le PC de la bibliotheque

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
3. Ajoutez les variables d'environnement: DATABASE_URL, JWT_SECRET, ADMIN_SETUP_CODE, ADMIN_ACCESS_CODE, NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_LIBRARY_NAME
4. Deployez
5. En local: npm install puis npm run db:init puis npm run db:seed
6. Admin par defaut: admin@espa.mg / Admin@2026 (a changer)
7. Acces admin: 5 clics coin superieur droit de la home, ou /admin/connexion directement

## Mode hors-ligne (serveur de secours bibliotheque)

```bash
cd offline-server
npm install
cp .env.example .env
npm run init-data
npm start
```

Le serveur ecoute sur http://localhost:3500. Rendez-le accessible sur le Wi-Fi local de la bibliotheque (meme sans internet) pour que les etudiants continuent a consulter le catalogue et emprunter en cas de coupure.

## Securite

- Bcrypt pour les mots de passe
- JWT + cookies HttpOnly
- Triple facteur admin: email + mdp + code secret
- Acces admin invisible sur le site public
- Route /admin/setup desactivee des qu'un admin existe

---

*Projet academique - Ecole Superieure Polytechnique d'Antsiranana, 2eme annee, 2026.*
