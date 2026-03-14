@echo off
cd /d "C:\PRIVATE\AI\1. DEFINITIVNO\AISBP_WEBAPP\webapp-aisbp-main"
echo === APPLYING PATCH ===
node apply_simulation_fix.cjs
if %ERRORLEVEL% neq 0 ( echo PATCH FAILED & pause & exit /b 1 )
echo === BUILDING ===
call npm run build
if %ERRORLEVEL% neq 0 ( echo BUILD FAILED & pause & exit /b 1 )
echo === DONE ===
pause
