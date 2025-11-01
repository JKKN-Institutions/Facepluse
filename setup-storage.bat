@echo off
REM Supabase Storage Bucket Setup Script (Windows)
REM This script provides instructions to create the mood-captures bucket

echo.
echo ========================================
echo   Supabase Storage Setup
echo ========================================
echo.
echo The mood-captures storage bucket needs to be created.
echo.
echo QUICKEST METHOD:
echo ----------------------------------------
echo.
echo 1. Open this URL in your browser:
echo    https://supabase.com/dashboard/project/gjgmjkapgtefuovmrydw/sql/new
echo.
echo 2. Copy the contents of: supabase-setup-storage.sql
echo.
echo 3. Paste into the SQL Editor
echo.
echo 4. Click 'Run'
echo.
echo 5. Done! Restart your app.
echo.
echo ========================================
echo.
echo For detailed instructions, see: SETUP_STORAGE.md
echo.
echo Or visit the setup API endpoint:
echo    http://localhost:3000/api/setup-storage
echo.
echo ========================================
echo.
echo This is a one-time setup.
echo Once done, images will upload automatically!
echo.
pause
