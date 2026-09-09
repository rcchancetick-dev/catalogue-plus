#!/bin/bash

REPO_URL="https://github.com/rcchancetick-dev/catalogue-plus.git"
PROJECT_DIR="catalogue-plus"

aller_dans_projet() {
    if [ -f "package.json" ] && [ -d "pages" ]; then
        return 0
    fi
    if [ -f "$PROJECT_DIR/package.json" ]; then
        cd "$PROJECT_DIR"
        return 0
    fi
    if ! command -v git &> /dev/null; then
        echo
        echo "[ERREUR] Le programme \"Git\" n'est pas installe, il est indispensable"
        echo "         pour telecharger le site. Choisis l'option 4 du menu"
        echo "         (\"Installer ou reparer les composants\") pour etre guide."
        echo
        read -p "Appuie sur Entree pour continuer..."
        return 1
    fi
    echo
    echo "[INFO] Le site n'est pas encore present sur cet ordinateur."
    echo "       Telechargement en cours, merci de patienter..."
    echo
    if ! git clone "$REPO_URL" "$PROJECT_DIR"; then
        echo
        echo "[ERREUR] Le telechargement a echoue. Verifie ta connexion Internet"
        echo "         et reessaie."
        echo
        read -p "Appuie sur Entree pour continuer..."
        return 1
    fi
    cd "$PROJECT_DIR"
    echo
    echo "[OK] Site telecharge avec succes."
    echo
    return 0
}

afficher_adresses() {
    if command -v ifconfig &> /dev/null; then
        ifconfig | grep "inet "
    else
        ip -4 addr | grep "inet "
    fi
}

demarrer() {
    clear
    echo "============================================================"
    echo "  DEMARRAGE DU SITE"
    echo "============================================================"
    echo

    if ! command -v node &> /dev/null; then
        echo "[ERREUR] Un composant necessaire (\"Node.js\") n'est pas installe."
        echo "         Retourne au menu et choisis l'option 4 pour l'installer."
        echo
        read -p "Appuie sur Entree pour continuer..."
        return
    fi

    aller_dans_projet || return

    if [ ! -d "node_modules" ]; then
        echo "[INFO] Premiere utilisation : installation des composants du site..."
        echo "       (patiente quelques minutes, cela ne se refera plus ensuite)"
        echo
        npm install
        echo
    fi
    if [ -f "offline-server/package.json" ] && [ ! -d "offline-server/node_modules" ]; then
        (cd offline-server && npm install)
    fi

    echo "============================================================"
    echo "  ADRESSE A UTILISER SUR LES TELEPHONES / AUTRES PC"
    echo "============================================================"
    echo
    echo "1. Active le partage de connexion / point d'acces wifi de ce PC"
    echo "2. Connecte le telephone a ce reseau wifi"
    echo "3. Dans le navigateur du telephone, tape l'une des adresses ci-dessous"
    echo "   suivie de :3000  -  Exemple : http://192.168.1.20:3000"
    echo
    echo "------------------------------------------------------------"
    afficher_adresses
    echo "------------------------------------------------------------"
    echo
    echo "============================================================"
    echo "  LE SITE DEMARRE... (fenetre a laisser ouverte)"
    echo "============================================================"
    echo
    echo "Pour arreter le site : appuie sur Ctrl+C."
    echo

    if [ -f "offline-server/server.js" ]; then
        cd offline-server
        node server.js
    else
        npm run offline
    fi

    echo
    echo "Le site s'est arrete."
    read -p "Appuie sur Entree pour revenir au menu..."
}

afficher_lien() {
    clear
    echo "============================================================"
    echo "  ADRESSES DISPONIBLES SUR CET ORDINATEUR"
    echo "============================================================"
    echo
    echo "Pour qu'un telephone ou un autre PC accede au site, il doit d'abord"
    echo "etre connecte au meme reseau wifi que cet ordinateur."
    echo
    echo "Ensuite, dans le navigateur de l'autre appareil, il faut taper une"
    echo "des adresses ci-dessous suivie de :3000"
    echo "Exemple complet : http://192.168.1.20:3000"
    echo
    echo "------------------------------------------------------------"
    afficher_adresses
    echo "------------------------------------------------------------"
    echo
    echo "Rappel : le site doit etre demarre (option 1 du menu) pour que"
    echo "ce lien fonctionne reellement."
    echo
    read -p "Appuie sur Entree pour revenir au menu..."
}

verifier() {
    clear
    echo "============================================================"
    echo "  VERIFICATION DE L'INSTALLATION"
    echo "============================================================"
    echo

    TOUT_OK=1

    if command -v node &> /dev/null; then
        echo "[OK]     Node.js est installe."
    else
        echo "[MANQUE] Node.js n'est pas installe."
        TOUT_OK=0
    fi

    if command -v git &> /dev/null; then
        echo "[OK]     Git est installe."
    else
        echo "[MANQUE] Git n'est pas installe."
        TOUT_OK=0
    fi

    if [ -f "package.json" ] && [ -d "pages" ]; then
        echo "[OK]     Le dossier du site est present ici."
    elif [ -f "$PROJECT_DIR/package.json" ]; then
        echo "[OK]     Le dossier du site est present (dans \"$PROJECT_DIR\")."
    else
        echo "[MANQUE] Le dossier du site n'est pas encore telecharge."
        TOUT_OK=0
    fi

    if [ -d "node_modules" ] || [ -d "$PROJECT_DIR/node_modules" ]; then
        echo "[OK]     Les composants du site sont installes."
    else
        echo "[MANQUE] Les composants du site ne sont pas encore installes."
        TOUT_OK=0
    fi

    echo
    if [ "$TOUT_OK" -eq 1 ]; then
        echo "Tout est en ordre ! Tu peux demarrer le site avec l'option 1."
    else
        echo "Certains elements sont manquants. Utilise l'option 4 du menu"
        echo "pour les installer automatiquement."
    fi
    echo
    read -p "Appuie sur Entree pour revenir au menu..."
}

installer() {
    clear
    echo "============================================================"
    echo "  INSTALLATION / REPARATION DES COMPOSANTS"
    echo "============================================================"
    echo

    if ! command -v node &> /dev/null; then
        echo "[ETAPE 1] Node.js n'est pas installe. Il est indispensable."
        echo
        echo "  1. Va sur https://nodejs.org"
        echo "  2. Telecharge la version LTS (recommandee)"
        echo "  3. Installe-la, puis reviens choisir a nouveau l'option 4."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi
    echo "[OK] Node.js est installe."
    echo

    if ! command -v git &> /dev/null; then
        echo "[ETAPE 2] Git n'est pas installe. Il est indispensable pour"
        echo "          telecharger et mettre a jour le site."
        echo
        echo "  - Mac   : tape 'git' dans le terminal, macOS proposera de l'installer"
        echo "  - Linux : sudo apt install git   (ou l'equivalent de ta distribution)"
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi
    echo "[OK] Git est installe."
    echo

    aller_dans_projet || return

    echo "[ETAPE 3] Installation des composants du site..."
    echo "          (peut prendre quelques minutes)"
    echo
    npm install
    echo
    if [ -f "offline-server/package.json" ]; then
        (cd offline-server && npm install)
    fi
    echo
    echo "[OK] Tout est installe. Tu peux demarrer le site avec l'option 1."
    echo
    read -p "Appuie sur Entree pour revenir au menu..."
}

mettre_a_jour() {
    clear
    echo "============================================================"
    echo "  MISE A JOUR DU SITE"
    echo "============================================================"
    echo

    aller_dans_projet || return

    if ! command -v git &> /dev/null; then
        echo "[ERREUR] Git n'est pas installe, impossible de verifier les mises"
        echo "         a jour. Utilise l'option 4 du menu pour l'installer."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi

    if [ ! -d ".git" ]; then
        echo "[ERREUR] Ce dossier n'a pas ete telecharge avec Git, la mise a jour"
        echo "         automatique n'est pas possible ici."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi

    echo "Recuperation de la derniere version depuis Internet..."
    echo
    if ! git pull; then
        echo
        echo "[ATTENTION] La mise a jour a echoue. Verifie ta connexion Internet."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi

    echo
    echo "Mise a jour des composants du site..."
    npm install
    if [ -f "offline-server/package.json" ]; then
        (cd offline-server && npm install)
    fi

    echo
    echo "[OK] Le site est maintenant a jour."
    echo
    read -p "Appuie sur Entree pour revenir au menu..."
}

tout_refaire() {
    clear
    echo "============================================================"
    echo "  REINSTALLATION COMPLETE DEPUIS ZERO"
    echo "============================================================"
    echo
    echo "ATTENTION : cette option supprime le dossier actuel du site et le"
    echo "retelecharge entierement neuf. Utile en cas de gros probleme."
    echo
    echo "Les livres, emprunts et comptes deja enregistres dans la base de"
    echo "donnees locale seront perdus si tu continues."
    echo
    read -p "Es-tu bien sur de vouloir continuer ? (oui / non) : " CONFIRME
    if [ "$CONFIRME" != "oui" ]; then
        echo
        echo "Operation annulee, aucun changement effectue."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi

    if ! command -v git &> /dev/null; then
        echo "[ERREUR] Git n'est pas installe. Utilise l'option 4 du menu d'abord."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi

    if [ -d "$PROJECT_DIR" ]; then
        echo
        echo "Suppression de l'ancien dossier \"$PROJECT_DIR\"..."
        rm -rf "$PROJECT_DIR"
    fi

    echo
    echo "Telechargement d'une version neuve du site..."
    echo
    if ! git clone "$REPO_URL" "$PROJECT_DIR"; then
        echo
        echo "[ERREUR] Le telechargement a echoue. Verifie ta connexion Internet."
        echo
        read -p "Appuie sur Entree pour revenir au menu..."
        return
    fi

    cd "$PROJECT_DIR"
    echo
    echo "Installation des composants..."
    npm install
    if [ -f "offline-server/package.json" ]; then
        (cd offline-server && npm install)
    fi

    echo
    echo "[OK] Reinstallation terminee. Tu peux demarrer le site avec l'option 1."
    echo
    read -p "Appuie sur Entree pour revenir au menu..."
}

aide() {
    clear
    echo "============================================================"
    echo "  AIDE ET EXPLICATIONS"
    echo "============================================================"
    echo
    echo "Ce menu permet de faire fonctionner Catalogue+ sans connexion"
    echo "Internet, par exemple pendant une coupure ou dans une salle sans"
    echo "wifi. Voici ce que fait chaque option :"
    echo
    echo "  1. Demarrer le site        - a utiliser a chaque fois que tu veux"
    echo "                                que les etudiants puissent emprunter"
    echo "                                des livres depuis leur telephone."
    echo "  2. Afficher le lien        - montre l'adresse a taper sur un"
    echo "                                telephone, sans redemarrer le site."
    echo "  3. Verifier l'installation - controle que tout est pret, sans"
    echo "                                rien modifier."
    echo "  4. Installer/reparer       - a utiliser si l'option 1 affiche une"
    echo "                                erreur, ou la toute premiere fois."
    echo "  5. Mettre a jour           - recupere les dernieres ameliorations"
    echo "                                du site depuis Internet."
    echo "  6. Tout refaire            - en dernier recours si plus rien ne"
    echo "                                fonctionne. Attention, cela efface"
    echo "                                les donnees locales deja enregistrees."
    echo
    echo "En cas de probleme persistant, contacte la personne qui a developpe"
    echo "le site en lui montrant le message d'erreur affiche a l'ecran."
    echo
    read -p "Appuie sur Entree pour revenir au menu..."
}

while true; do
    clear
    echo "============================================================"
    echo "               CATALOGUE+  -  MENU DU MODE LOCAL"
    echo "============================================================"
    echo
    echo "  Choisis une option en tapant son numero, puis Entree :"
    echo
    echo "  1. Demarrer le site (le plus courant)"
    echo "  2. Afficher le lien pour connecter un telephone / autre PC"
    echo "  3. Verifier que tout est bien installe sur cet ordinateur"
    echo "  4. Installer ou reparer les composants necessaires"
    echo "  5. Mettre a jour le site (recuperer la derniere version)"
    echo "  6. Tout reinstaller depuis zero (en cas de gros probleme)"
    echo "  7. Aide et explications"
    echo "  8. Quitter"
    echo
    echo "============================================================"
    read -p "Ton choix (1 a 8) : " CHOIX

    case "$CHOIX" in
        1) demarrer ;;
        2) afficher_lien ;;
        3) verifier ;;
        4) installer ;;
        5) mettre_a_jour ;;
        6) tout_refaire ;;
        7) aide ;;
        8) exit 0 ;;
        *) echo; echo "Choix non reconnu, reessaie avec un numero entre 1 et 8."; read -p "Appuie sur Entree..." ;;
    esac
done
