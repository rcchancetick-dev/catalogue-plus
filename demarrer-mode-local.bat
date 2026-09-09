@echo off
setlocal enabledelayedexpansion
title Catalogue+ - Mode local
color 0A

set "REPO_URL=https://github.com/rcchancetick-dev/catalogue-plus.git"
set "PROJECT_DIR=catalogue-plus"

:MENU
cls
echo ============================================================
echo                CATALOGUE+  -  MENU DU MODE LOCAL
echo ============================================================
echo.
echo   Choisis une option en tapant son numero, puis Entree :
echo.
echo   1. Demarrer le site (le plus courant)
echo   2. Afficher le lien pour connecter un telephone / autre PC
echo   3. Verifier que tout est bien installe sur cet ordinateur
echo   4. Installer ou reparer les composants necessaires
echo   5. Mettre a jour le site (recuperer la derniere version)
echo   6. Tout reinstaller depuis zero (en cas de gros probleme)
echo   7. Aide et explications
echo   8. Quitter
echo.
echo ============================================================
set /p CHOIX="Ton choix (1 a 8) : "

if "%CHOIX%"=="1" goto :DEMARRER
if "%CHOIX%"=="2" goto :AFFICHER_LIEN
if "%CHOIX%"=="3" goto :VERIFIER
if "%CHOIX%"=="4" goto :INSTALLER
if "%CHOIX%"=="5" goto :METTRE_A_JOUR
if "%CHOIX%"=="6" goto :TOUT_REFAIRE
if "%CHOIX%"=="7" goto :AIDE
if "%CHOIX%"=="8" exit /b 0
echo.
echo Choix non reconnu, reessaie avec un numero entre 1 et 8.
pause
goto :MENU

REM ============================================================
REM  Utilitaire : se positionner dans le dossier du projet
REM  (le telecharge automatiquement s'il est absent)
REM ============================================================
:ALLER_DANS_PROJET
if exist "package.json" if exist "pages" (
    exit /b 0
)
if exist "%PROJECT_DIR%\package.json" (
    cd "%PROJECT_DIR%"
    exit /b 0
)
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le programme "Git" n'est pas installe, il est indispensable
    echo          pour telecharger le site. Choisis l'option 4 du menu
    echo          ("Installer ou reparer les composants") pour etre guide.
    echo.
    pause
    exit /b 1
)
echo.
echo [INFO] Le site n'est pas encore present sur cet ordinateur.
echo        Telechargement en cours, merci de patienter...
echo.
git clone "%REPO_URL%" "%PROJECT_DIR%"
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le telechargement a echoue. Verifie ta connexion Internet
    echo          et reessaie.
    echo.
    pause
    exit /b 1
)
cd "%PROJECT_DIR%"
echo.
echo [OK] Site telecharge avec succes.
echo.
exit /b 0

REM ============================================================
REM  1. DEMARRER LE SITE
REM ============================================================
:DEMARRER
cls
echo ============================================================
echo   DEMARRAGE DU SITE
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Un composant necessaire ("Node.js") n'est pas installe.
    echo          Retourne au menu et choisis l'option 4 pour l'installer.
    echo.
    pause
    goto :MENU
)

call :ALLER_DANS_PROJET
if %errorlevel% neq 0 goto :MENU

if not exist "node_modules" (
    echo [INFO] Premiere utilisation : installation des composants du site...
    echo        (patiente quelques minutes, cela ne se refera plus ensuite)
    echo.
    call npm install
    echo.
)
if exist "offline-server\package.json" if not exist "offline-server\node_modules" (
    pushd offline-server
    call npm install
    popd
)

echo ============================================================
echo   ADRESSE A UTILISER SUR LES TELEPHONES / AUTRES PC
echo ============================================================
echo.
echo 1. Active le point d'acces mobile de ce PC si ce n'est pas deja fait
echo    (Parametres Windows - Reseau et Internet - Point d'acces mobile)
echo 2. Connecte le telephone a ce reseau wifi
echo 3. Dans le navigateur du telephone, tape l'une des adresses ci-dessous
echo    suivie de :3000  -  Exemple : http://192.168.137.1:3000
echo.
echo ------------------------------------------------------------
ipconfig | findstr /i "IPv4"
echo ------------------------------------------------------------
echo.
echo ============================================================
echo   LE SITE DEMARRE... (fenetre a laisser ouverte)
echo ============================================================
echo.
echo Pour arreter le site : appuie sur Ctrl+C, ou ferme cette fenetre.
echo.

if exist "offline-server\server.js" (
    cd offline-server
    node server.js
) else (
    call npm run offline
)

echo.
echo Le site s'est arrete.
pause
goto :MENU

REM ============================================================
REM  2. AFFICHER LE LIEN DE CONNEXION SANS DEMARRER LE SITE
REM ============================================================
:AFFICHER_LIEN
cls
echo ============================================================
echo   ADRESSES DISPONIBLES SUR CET ORDINATEUR
echo ============================================================
echo.
echo Pour qu'un telephone ou un autre PC accede au site, il doit d'abord
echo etre connecte au meme reseau wifi que cet ordinateur (par exemple
echo via le point d'acces mobile de Windows).
echo.
echo Ensuite, dans le navigateur de l'autre appareil, il faut taper une
echo des adresses ci-dessous suivie de :3000
echo Exemple complet : http://192.168.137.1:3000
echo.
echo ------------------------------------------------------------
ipconfig | findstr /i "IPv4"
echo ------------------------------------------------------------
echo.
echo Rappel : le site doit etre demarre (option 1 du menu) pour que
echo ce lien fonctionne reellement.
echo.
pause
goto :MENU

REM ============================================================
REM  3. VERIFIER L'INSTALLATION
REM ============================================================
:VERIFIER
cls
echo ============================================================
echo   VERIFICATION DE L'INSTALLATION
echo ============================================================
echo.

set "TOUT_OK=1"

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK]     Node.js est installe.
) else (
    echo [MANQUE] Node.js n'est pas installe.
    set "TOUT_OK=0"
)

where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [OK]     Git est installe.
) else (
    echo [MANQUE] Git n'est pas installe.
    set "TOUT_OK=0"
)

if exist "package.json" if exist "pages" (
    echo [OK]     Le dossier du site est present ici.
) else (
    if exist "%PROJECT_DIR%\package.json" (
        echo [OK]     Le dossier du site est present (dans "%PROJECT_DIR%").
    ) else (
        echo [MANQUE] Le dossier du site n'est pas encore telecharge.
        set "TOUT_OK=0"
    )
)

if exist "node_modules" (
    echo [OK]     Les composants du site sont installes.
) else (
    if exist "%PROJECT_DIR%\node_modules" (
        echo [OK]     Les composants du site sont installes.
    ) else (
        echo [MANQUE] Les composants du site ne sont pas encore installes.
        set "TOUT_OK=0"
    )
)

echo.
if "%TOUT_OK%"=="1" (
    echo Tout est en ordre ! Tu peux demarrer le site avec l'option 1.
) else (
    echo Certains elements sont manquants. Utilise l'option 4 du menu
    echo pour les installer automatiquement.
)
echo.
pause
goto :MENU

REM ============================================================
REM  4. INSTALLER OU REPARER LES COMPOSANTS
REM ============================================================
:INSTALLER
cls
echo ============================================================
echo   INSTALLATION / REPARATION DES COMPOSANTS
echo ============================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ETAPE 1] Node.js n'est pas installe. Il est indispensable.
    echo.
    echo   1. Va sur https://nodejs.org
    echo   2. Telecharge la version "LTS" (recommandee)
    echo   3. Installe-la normalement (suivant / suivant / terminer)
    echo   4. Reviens ensuite dans ce menu et choisis a nouveau l'option 4.
    echo.
    pause
    goto :MENU
)
echo [OK] Node.js est installe.
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ETAPE 2] Git n'est pas installe. Il est indispensable pour
    echo           telecharger et mettre a jour le site.
    echo.
    echo   1. Va sur https://git-scm.com/downloads
    echo   2. Telecharge et installe la version Windows
    echo      (suivant / suivant / terminer, les options par defaut suffisent)
    echo   3. Reviens ensuite dans ce menu et choisis a nouveau l'option 4.
    echo.
    pause
    goto :MENU
)
echo [OK] Git est installe.
echo.

call :ALLER_DANS_PROJET
if %errorlevel% neq 0 goto :MENU

echo [ETAPE 3] Installation des composants du site...
echo           (peut prendre quelques minutes)
echo.
call npm install
echo.
if exist "offline-server\package.json" (
    pushd offline-server
    call npm install
    popd
)
echo.
echo [OK] Tout est installe. Tu peux demarrer le site avec l'option 1.
echo.
pause
goto :MENU

REM ============================================================
REM  5. METTRE A JOUR LE SITE
REM ============================================================
:METTRE_A_JOUR
cls
echo ============================================================
echo   MISE A JOUR DU SITE
echo ============================================================
echo.

call :ALLER_DANS_PROJET
if %errorlevel% neq 0 goto :MENU

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Git n'est pas installe, impossible de verifier les mises
    echo          a jour. Utilise l'option 4 du menu pour l'installer.
    echo.
    pause
    goto :MENU
)

if not exist ".git" (
    echo [ERREUR] Ce dossier n'a pas ete telecharge avec Git, la mise a jour
    echo          automatique n'est pas possible ici.
    echo.
    pause
    goto :MENU
)

echo Recuperation de la derniere version depuis Internet...
echo.
git pull
if %errorlevel% neq 0 (
    echo.
    echo [ATTENTION] La mise a jour a echoue. Verifie ta connexion Internet.
    echo.
    pause
    goto :MENU
)

echo.
echo Mise a jour des composants du site...
call npm install
if exist "offline-server\package.json" (
    pushd offline-server
    call npm install
    popd
)

echo.
echo [OK] Le site est maintenant a jour.
echo.
pause
goto :MENU

REM ============================================================
REM  6. TOUT REINSTALLER DEPUIS ZERO
REM ============================================================
:TOUT_REFAIRE
cls
echo ============================================================
echo   REINSTALLATION COMPLETE DEPUIS ZERO
echo ============================================================
echo.
echo ATTENTION : cette option supprime le dossier actuel du site et le
echo retelecharge entierement neuf. Utile en cas de gros probleme.
echo.
echo Les livres, emprunts et comptes deja enregistres dans la base de
echo donnees locale seront perdus si tu continues.
echo.
set /p CONFIRME="Es-tu bien sur de vouloir continuer ? (oui / non) : "
if /i not "%CONFIRME%"=="oui" (
    echo.
    echo Operation annulee, aucun changement effectue.
    echo.
    pause
    goto :MENU
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Git n'est pas installe. Utilise l'option 4 du menu d'abord.
    echo.
    pause
    goto :MENU
)

if exist "%PROJECT_DIR%" (
    echo.
    echo Suppression de l'ancien dossier "%PROJECT_DIR%"...
    rmdir /s /q "%PROJECT_DIR%"
)

echo.
echo Telechargement d'une version neuve du site...
echo.
git clone "%REPO_URL%" "%PROJECT_DIR%"
if %errorlevel% neq 0 (
    echo.
    echo [ERREUR] Le telechargement a echoue. Verifie ta connexion Internet.
    echo.
    pause
    goto :MENU
)

cd "%PROJECT_DIR%"
echo.
echo Installation des composants...
call npm install
if exist "offline-server\package.json" (
    pushd offline-server
    call npm install
    popd
)

echo.
echo [OK] Reinstallation terminee. Tu peux demarrer le site avec l'option 1.
echo.
pause
goto :MENU

REM ============================================================
REM  7. AIDE
REM ============================================================
:AIDE
cls
echo ============================================================
echo   AIDE ET EXPLICATIONS
echo ============================================================
echo.
echo Ce menu permet de faire fonctionner Catalogue+ sans connexion
echo Internet, par exemple pendant une coupure ou dans une salle sans
echo wifi. Voici ce que fait chaque option :
echo.
echo   1. Demarrer le site       - a utiliser a chaque fois que tu veux
echo                                que les etudiants puissent emprunter
echo                                des livres depuis leur telephone.
echo   2. Afficher le lien       - montre l'adresse a taper sur un
echo                                telephone, sans redemarrer le site.
echo   3. Verifier l'installation - controle que tout est pret, sans
echo                                rien modifier.
echo   4. Installer/reparer      - a utiliser si l'option 1 affiche une
echo                                erreur, ou la toute premiere fois.
echo   5. Mettre a jour          - recupere les dernieres ameliorations
echo                                du site depuis Internet.
echo   6. Tout refaire           - en dernier recours si plus rien ne
echo                                fonctionne. Attention, cela efface
echo                                les donnees locales deja enregistrees.
echo.
echo En cas de probleme persistant, contacte la personne qui a developpe
echo le site en lui montrant le message d'erreur affiche a l'ecran.
echo.
pause
goto :MENU
