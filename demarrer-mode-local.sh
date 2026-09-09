#!/bin/bash
set -e
clear
echo "============================================================"
echo "  CATALOGUE+ - DEMARRAGE DU MODE LOCAL (SANS INTERNET)"
echo "============================================================"
echo

REPO_URL="https://github.com/rcchancetick-dev/catalogue-plus.git"
PROJECT_DIR="catalogue-plus"

if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installe sur cet ordinateur."
    echo
    echo "Pour l'installer :"
    echo "  1. Va sur https://nodejs.org"
    echo "  2. Telecharge la version LTS (recommandee)"
    echo "  3. Installe-la, puis relance ce script."
    echo
    read -p "Appuie sur Entree pour fermer..."
    exit 1
fi
echo "[OK] Node.js detecte."
echo

if [ -f "package.json" ] && [ -d "pages" ]; then
    echo "[INFO] Projet detecte dans le dossier courant."
else
    echo "[INFO] Aucun projet Catalogue+ trouve dans ce dossier."
    echo "        Ce script va telecharger automatiquement tout le code source."
    echo

    if ! command -v git &> /dev/null; then
        echo "[ERREUR] Git n'est pas installe sur cet ordinateur, il est necessaire"
        echo "         pour telecharger et mettre a jour automatiquement le projet."
        echo
        echo "Pour l'installer :"
        echo "  - Mac : tape 'git' dans le terminal, macOS proposera de l'installer"
        echo "  - Linux : sudo apt install git   (ou l'equivalent de ta distribution)"
        echo
        read -p "Appuie sur Entree pour fermer..."
        exit 1
    fi
    echo "[OK] Git detecte."
    echo

    if [ -d "$PROJECT_DIR" ]; then
        echo "[INFO] Un dossier \"$PROJECT_DIR\" existe deja a cote de ce script."
        cd "$PROJECT_DIR"
    else
        echo "[INFO] Telechargement du projet complet depuis GitHub..."
        echo "        (necessite une connexion Internet, une seule fois)"
        echo
        git clone "$REPO_URL" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        echo
        echo "[OK] Projet telecharge avec succes dans le dossier \"$PROJECT_DIR\"."
        echo
    fi
fi

if command -v git &> /dev/null && [ -d ".git" ]; then
    echo "============================================================"
    echo "  VERIFICATION DES MISES A JOUR..."
    echo "============================================================"
    echo
    if git pull; then
        echo "[OK] Projet a jour."
    else
        echo "[ATTENTION] La mise a jour automatique a echoue (pas d'Internet ?)."
        echo "            Le site va quand meme demarrer avec la version deja presente."
    fi
    echo
fi

if [ ! -d "node_modules" ]; then
    echo "[INFO] Installation des dependances (premiere fois ou mise a jour)..."
    echo "        (cette etape peut prendre quelques minutes, patience)"
    echo
    npm install
    echo
    echo "[OK] Dependances installees."
    echo
fi

if [ -f "offline-server/package.json" ] && [ ! -d "offline-server/node_modules" ]; then
    echo "[INFO] Installation des dependances du serveur local..."
    (cd offline-server && npm install)
    echo
fi

echo "============================================================"
echo "  RECUPERATION DE L'ADRESSE RESEAU DE CET ORDINATEUR"
echo "============================================================"
echo
echo "Pour connecter les telephones des etudiants :"
echo "  1. Active le partage de connexion / point d'acces wifi"
echo "  2. Connecte les telephones a ce reseau wifi"
echo "  3. Utilise l'une des adresses IP listees ci-dessous, suivie de :3000"
echo "     Exemple : http://192.168.1.20:3000"
echo
echo "Adresses reseau disponibles sur cet ordinateur :"
echo "------------------------------------------------------------"
if command -v ifconfig &> /dev/null; then
    ifconfig | grep "inet "
else
    ip -4 addr | grep "inet "
fi
echo "------------------------------------------------------------"
echo
echo "============================================================"
echo "  DEMARRAGE DU SERVEUR..."
echo "============================================================"
echo
echo "Pour arreter le serveur a tout moment : appuie sur Ctrl+C"
echo

if [ -f "offline-server/server.js" ]; then
    cd offline-server
    node server.js
else
    npm run offline
fi
