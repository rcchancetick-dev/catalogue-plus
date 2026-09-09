@echo off
setlocal enabledelayedexpansion
title Catalogue+ - Mode local (hors ligne)
color 0A
cls
echo ============================================================
echo   CATALOGUE+ - DEMARRAGE DU MODE LOCAL (SANS INTERNET)
echo ============================================================
echo.

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

if not exist "node_modules" (
    echo [INFO] Premiere installation detectee. Installation des dependances...
    echo         (cette etape peut prendre quelques minutes, patience)
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERREUR] L'installation a echoue. Verifie ta connexion Internet
        echo          (necessaire uniquement pour cette toute premiere etape).
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
