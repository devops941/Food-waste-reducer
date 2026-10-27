@echo off
:: Check for admin permissions
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ============================================================
    echo  ERROR: ADMINISTRATOR RIGHTS REQUIRED
    echo ============================================================
    echo.
    echo  Please right-click on this file (FIX_FIREWALL.bat) 
    echo  and select "Run as administrator".
    echo.
    echo ============================================================
    pause
    exit /b 1
)

echo ============================================================
echo   Fixing Mobile Network Error - Allowing Port 5000
echo ============================================================
echo.
echo [1/3] Adding Windows Firewall rule for Port 5000...
netsh advfirewall firewall add rule name="Allow Pantry Server Port 5000" dir=in action=allow protocol=TCP localport=5000 profile=any

echo.
echo [2/3] Unblocking Node.js incoming connections...
netsh advfirewall firewall set rule name="Node.js JavaScript Runtime" new action=allow

echo.
echo [3/3] Setting Network Profile to Private (allows local device communication)...
powershell -NoProfile -Command "Set-NetConnectionProfile -InterfaceAlias 'Ethernet' -NetworkCategory Private"

echo.
echo ============================================================
echo   SUCCESS! Windows Firewall has been unblocked.
echo   Now press 'r' in your Expo terminal or reload your phone.
echo ============================================================
echo.
pause
