@echo off
echo ============================================
echo   Delhi UHI Platform - Windows Setup
echo ============================================
echo.

python --version >nul 2>&1
if errorlevel 1 ( echo ERROR: Python not found. && pause && exit /b 1 )
node --version >nul 2>&1
if errorlevel 1 ( echo ERROR: Node.js not found. && pause && exit /b 1 )

echo [1/4] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate.bat

echo.
echo [2/4] Installing Python packages (Python 3.13 safe)...
python -m pip install --upgrade pip --quiet
pip install numpy scipy scikit-learn pandas joblib --quiet
pip install opencv-python Pillow matplotlib seaborn --quiet
pip install flask flask-cors python-dotenv tqdm --quiet

echo     Trying rasterio (optional)...
pip install rasterio --find-links https://girder.github.io/large_image_wheels --quiet 2>nul
if errorlevel 1 (
    echo     rasterio skipped - project uses Pillow fallback. That is fine.
) else (
    echo     rasterio OK
)

echo.
echo [3/4] Installing frontend...
cd frontend && call npm install --silent && cd ..

echo.
echo [4/4] Creating data folders...
if not exist data\raw       mkdir data\raw
if not exist data\processed mkdir data\processed
if not exist data\outputs   mkdir data\outputs

echo.
echo ============================================
echo  DONE. Next steps:
echo.
echo  1. Copy .tif + .png files to data\raw\
echo  2. Double-click run_pipeline.bat
echo  3. CMD 1: venv\Scripts\activate  then  python backend\api\app.py
echo  4. CMD 2: cd frontend  then  npm start
echo  5. Open: http://localhost:3000
echo ============================================
pause
