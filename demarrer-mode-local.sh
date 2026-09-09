#!/bin/bash
set -e
clear
echo "============================================================"
echo "  CATALOGUE+ - DEMARRAGE DU MODE LOCAL (SANS INTERNET)"
echo "============================================================"
echo

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

if [ ! -d "node_modules" ]; then
    echo "[INFO] Premiere installation detectee. Installation des dependances..."
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
