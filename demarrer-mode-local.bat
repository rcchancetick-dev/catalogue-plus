@echo off
setlocal enabledelayedexpansion
title Catalogue+ - Mode local (hors ligne)
color 0A
cls
echo ============================================================
echo   CATALOGUE+ - DEMARRAGE DU MODE LOCAL (SANS INTERNET)
echo ============================================================
echo.

set "REPO_URL=https://github.com/rcchancetick-dev/catalogue-plus.git"
set "PROJECT_DIR=catalogue-plus"

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe sur cet ordinateur.
    echo.
    echo Pour l'installer :
    echo   1. Va sur https://nodejs.org
    echo   2. Telecharge la version "LTS" (recommandee)
    echo   3. Installe-la normalement (suivant / suivant / terminer)
    echo   4. Relance ensuite ce fichier.
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js detecte.
echo.

REM --- Etape A : determiner si on est deja a l'interieur du projet ---
REM Si package.json existe dans le dossier courant, on considere qu'on est deja dans le projet.
if exist "package.json" if exist "pages" (
    echo [INFO] Projet detecte dans le dossier courant.
    goto :UPDATE_PROJECT
)

REM --- Etape B : le projet n'est pas ici. Faut-il le telecharger ? ---
echo [INFO] Aucun projet Catalogue+ trouve dans ce dossier.
echo         Ce fichier va telecharger automatiquement tout le code source.
echo.

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERREUR] Git n'est pas installe sur cet ordinateur, il est necessaire
    echo          pour telecharger et mettre a jour automatiquement le projet.
    echo.
    echo Pour l'installer :
    echo   1. Va sur https://git-scm.com/downloads
    echo   2. Telecharge et installe la version Windows (suivant / suivant / terminer)
    echo   3. Relance ensuite ce fichier.
    echo.
    pause
    exit /b 1
)
echo [OK] Git detecte.
echo.

if exist "%PROJECT_DIR%" (
    echo [INFO] Un dossier "%PROJECT_DIR%" existe deja a cote de ce script.
    cd "%PROJECT_DIR%"
    goto :UPDATE_PROJECT
)

echo [INFO] Telechargement du projet complet depuis GitHub...
echo         (necessite une connexion Internet, une seule fois)
echo.
git clone "%REPO_URL%" "%PROJECT_DIR%"
if %errorlevel% neq 0 (
    echo [ERREUR] Le telechargement a echoue. Verifie ta connexion Internet.
    pause
    exit /b 1
)
cd "%PROJECT_DIR%"
echo.
echo [OK] Projet telecharge avec succes dans le dossier "%PROJECT_DIR%".
echo.

:UPDATE_PROJECT
REM --- Etape C : verifier les mises a jour si Git est disponible ---
where git >nul 2>nul
if %errorlevel% equ 0 (
    if exist ".git" (
        echo ============================================================
        echo   VERIFICATION DES MISES A JOUR...
        echo ============================================================
        echo.
        git pull
        if %errorlevel% neq 0 (
            echo [ATTENTION] La mise a jour automatique a echoue (pas d'Internet ?).
            echo             Le site va quand meme demarrer avec la version deja presente.
        ) else (
            echo [OK] Projet a jour.
        )
        echo.
    )
)

REM --- Etape D : installer les dependances si necessaire ---
if not exist "node_modules" (
    echo [INFO] Installation des dependances (premiere fois ou mise a jour)...
    echo         (cette etape peut prendre quelques minutes, patience)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERREUR] L'installation a echoue. Verifie ta connexion Internet
        echo          (necessaire uniquement pour cette etape).
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependances installees.
    echo.
)

if exist "offline-server\package.json" (
    if not exist "offline-server\node_modules" (
        echo [INFO] Installation des dependances du serveur local...
        pushd offline-server
        call npm install
        popd
        echo.
    )
)

echo ============================================================
echo   RECUPERATION DE L'ADRESSE RESEAU DE CET ORDINATEUR
echo ============================================================
echo.
echo Pour connecter les telephones des etudiants :
echo   1. Active le point d'acces mobile Windows si ce n'est pas deja fait
echo      (Parametres - Reseau et Internet - Point d'acces mobile)
echo   2. Connecte les telephones a ce reseau wifi
echo   3. Utilise l'une des adresses IPv4 listees ci-dessous, suivie de :3000
echo      Exemple : http://192.168.137.1:3000
echo.
echo Adresses reseau disponibles sur cet ordinateur :
echo ------------------------------------------------------------
ipconfig | findstr /i "IPv4"
echo ------------------------------------------------------------
echo.
echo ============================================================
echo   DEMARRAGE DU SERVEUR...
echo ============================================================
echo.
echo Pour arreter le serveur a tout moment : appuie sur Ctrl+C
echo.

if exist "offline-server\server.js" (
    cd offline-server
    node server.js
) else (
    call npm run offline
)

echo.
echo Le serveur s'est arrete.
pause
