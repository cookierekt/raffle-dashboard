@echo off
echo Installing Home Instead Raffle Dashboard (Anaconda)...
echo.

REM Try different Python paths
echo Checking Python installation...

REM Try Anaconda/Miniconda paths
if exist "%USERPROFILE%\Anaconda3\python.exe" (
    set PYTHON_PATH=%USERPROFILE%\Anaconda3\python.exe
    goto :install
)

if exist "%USERPROFILE%\Miniconda3\python.exe" (
    set PYTHON_PATH=%USERPROFILE%\Miniconda3\python.exe
    goto :install
)

if exist "C:\ProgramData\Anaconda3\python.exe" (
    set PYTHON_PATH=C:\ProgramData\Anaconda3\python.exe
    goto :install
)

if exist "C:\Users\bir_k\python" (
    set PYTHON_PATH=C:\Users\bir_k\python
    goto :install
)

echo Python not found. Please:
echo 1. Open "Anaconda Prompt" from Start Menu
echo 2. Navigate to this folder: cd C:\Users\bir_k\raffle-dashboard
echo 3. Run: python app.py
echo.
pause
exit /b 1

:install
echo Found Python at: %PYTHON_PATH%
echo Installing dependencies...
"%PYTHON_PATH%" -m pip install -r requirements.txt

echo.
echo Setup complete!
echo Starting the application...
echo Open browser to: http://localhost:5000
echo.

"%PYTHON_PATH%" app.py
pause