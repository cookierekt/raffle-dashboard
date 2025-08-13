@echo off
echo Installing Home Instead Raffle Dashboard...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH.
    echo Please install Python 3.8+ from python.org
    echo.
    pause
    exit /b 1
)

echo Installing dependencies...
python -m pip install -r requirements.txt

echo.
echo Setup complete! 
echo.
echo To run the application:
echo   python app.py
echo.
echo Then open your browser and go to: http://localhost:5000
echo.
pause