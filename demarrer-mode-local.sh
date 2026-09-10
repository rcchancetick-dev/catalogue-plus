#!/bin/bash
# Catalogue+ - Script de demarrage en mode local (Mac / Linux)

REPO_URL="https://github.com/rcchancetick-dev/catalogue-plus.git"
PROJECT_DIR="catalogue-plus"

aller_dans_projet() {
    if [ -f "package.json" ] && [ -d "pages" ]; then
        return 0
    fi
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR" || return 1
        return 0
    fi
    if ! command -v git >/dev/null 2>&1; then
        echo ""
        echo "[ERREUR] Git n'est pas installe, impossible de telecharger le site."
        echo "         Installez-le (ex: sudo apt install git / brew install git) puis reessayez."
        return 1
    fi
    echo ""
    echo "[INFO] Le site n'est pas encore present sur cet ordinateur."
    echo "       Telechargement en cours, merci de patienter..."
    git clone "$REPO_URL" "$PROJECT_DIR" || return 1
    cd "$PROJECT_DIR" || return 1
    echo "[OK] Site telecharge avec succes."
    return 0
}

demarrer_en_ligne() {
    echo "============================================================"
    echo "  DEMARRAGE DU SITE EN LIGNE"
    echo "============================================================"
    echo ""
    echo "Ce mode necessite une connexion Internet active (Neon Postgres)."
    echo ""

    if ! command -v node >/dev/null 2>&1; then
        echo "[ERREUR] Node.js n'est pas installe. Installez-le depuis https://nodejs.org"
        return 1
    fi

    aller_dans_projet || return 1

    if [ ! -d "node_modules" ]; then
        echo "[INFO] Premiere utilisation : installation des composants du site..."
        npm install || { echo "[ERREUR] Installation echouee. Verifiez votre connexion Internet."; return 1; }
    fi

    echo ""
    echo "------------------------------------------------------------"
    echo "Adresses IP disponibles sur ce Wi-Fi (suivies de :3000) :"
    if command -v ip >/dev/null 2>&1; then
        ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1'
    else
        ifconfig | grep "inet " | grep -v 127.0.0.1
    fi
    echo "------------------------------------------------------------"
    echo ""
    echo "Le site demarre... Pour arreter : Ctrl+C"
    echo ""
    npm run dev -- -H 0.0.0.0
}

demarrer_hors_ligne() {
    echo "============================================================"
    echo "  DEMARRAGE DU SERVEUR HORS LIGNE"
    echo "============================================================"
    echo ""
    echo "Ce mode fonctionne SANS connexion Internet (base SQLite locale)."
    echo ""

    if ! command -v node >/dev/null 2>&1; then
        echo "[ERREUR] Node.js n'est pas installe. Installez-le depuis https://nodejs.org"
        return 1
    fi

    aller_dans_projet || return 1

    if [ ! -d "offline-server" ]; then
        echo "[ERREUR] Le dossier offline-server est introuvable dans ce projet."
        echo "         Mettez a jour le depot (git pull) pour le recuperer."
        return 1
    fi

    cd offline-server || return 1

    if [ ! -d "node_modules" ]; then
        echo "[INFO] Premiere utilisation : installation des composants du serveur hors ligne..."
        npm install || { echo "[ERREUR] Installation echouee. Verifiez votre connexion Internet."; cd ..; return 1; }
    fi

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            echo "[INFO] Creation du fichier de configuration .env..."
            cp ".env.example" ".env"
            echo "[OK] Fichier .env cree a partir de .env.example."
        else
            echo "[ATTENTION] Aucun .env.example trouve. Le serveur pourrait ne pas demarrer correctement."
        fi
    fi

    if [ ! -f "data/catalogueplus.db" ]; then
        echo "[INFO] Initialisation de la base de donnees locale..."
        npm run init-data || { echo "[ERREUR] Initialisation de la base echouee."; cd ..; return 1; }
    fi

    echo ""
    echo "------------------------------------------------------------"
    echo "Adresses IP disponibles sur ce Wi-Fi (suivies de :3500) :"
    if command -v ip >/dev/null 2>&1; then
        ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v '127.0.0.1'
    else
        ifconfig | grep "inet " | grep -v 127.0.0.1
    fi
    echo "------------------------------------------------------------"
    echo ""
    echo "Le serveur hors ligne demarre sur http://localhost:3500 ..."
    echo "Pour arreter : Ctrl+C"
    echo ""
    npm start
    cd ..
}

verifier_installation() {
    echo "============================================================"
    echo "  VERIFICATION DE L'INSTALLATION"
    echo "============================================================"
    echo ""
    command -v node >/dev/null 2>&1 && echo "[OK]     Node.js est installe." || echo "[MANQUE] Node.js n'est pas installe."
    command -v git >/dev/null 2>&1 && echo "[OK]     Git est installe." || echo "[MANQUE] Git n'est pas installe."

    if { [ -f "package.json" ] && [ -d "pages" ]; } || [ -f "$PROJECT_DIR/package.json" ]; then
        echo "[OK]     Le dossier du site est present."
    else
        echo "[MANQUE] Le dossier du site n'est pas encore telecharge."
    fi

    if [ -d "node_modules" ] || [ -d "$PROJECT_DIR/node_modules" ]; then
        echo "[OK]     Les composants du site sont installes."
    else
        echo "[MANQUE] Les composants du site ne sont pas encore installes."
    fi

    if [ -f "offline-server/package.json" ] || [ -f "$PROJECT_DIR/offline-server/package.json" ]; then
        echo "[OK]     Le serveur hors ligne est present."
    else
        echo "[MANQUE] Le serveur hors ligne (offline-server) est introuvable."
    fi
    echo ""
}

afficher_menu() {
    clear
    echo "============================================================"
    echo "               CATALOGUE+  -  MENU DU MODE LOCAL"
    echo "============================================================"
    echo ""
    echo "  1. Demarrer le site en ligne (avec Internet)"
    echo "  2. Demarrer le serveur hors ligne (sans Internet, salle bibliotheque)"
    echo "  3. Verifier que tout est bien installe sur cet ordinateur"
    echo "  4. Quitter"
    echo ""
    echo "============================================================"
    read -rp "Ton choix (1 a 4) : " CHOIX
    case "$CHOIX" in
        1) demarrer_en_ligne ;;
        2) demarrer_hors_ligne ;;
        3) verifier_installation; read -rp "Appuyez sur Entree pour continuer..." _ ;;
        4) exit 0 ;;
        *) echo "Choix non reconnu."; sleep 1 ;;
    esac
}

while true; do
    afficher_menu
done
