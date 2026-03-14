@echo off
chcp 65001 >nul
echo Git Push Backup - SVI FAJLOVI
echo =============================
echo.

cd /d "C:\PRIVATE\AI\1. DEFINITIVNO\AISBP_WEBAPP\webapp-aisbp-main"

echo Dodavanje SVIH fajlova i foldera...
git add .

echo Kreiranje commit-a...
git commit -m "Backup svih fajlova %date% %time%"

echo Push na GitHub...
git push

echo.
echo Svi fajlovi uspjesno push-ovani!
pause