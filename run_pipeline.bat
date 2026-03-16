@echo off
echo ============================================
echo   Delhi UHI Platform - Run ML Pipeline
echo ============================================
echo.

call venv\Scripts\activate.bat

echo [Step 1/4] Preprocessing satellite data...
python backend\ml\preprocess.py
if errorlevel 1 ( echo ERROR in preprocess.py && pause && exit /b 1 )

echo.
echo [Step 2/4] Training ML model...
python backend\ml\train.py
if errorlevel 1 ( echo ERROR in train.py && pause && exit /b 1 )

echo.
echo [Step 3/4] Generating predictions...
python backend\ml\predict.py
if errorlevel 1 ( echo ERROR in predict.py && pause && exit /b 1 )

echo.
echo [Step 4/4] Running scientific analysis...
python backend\ml\analysis.py
if errorlevel 1 ( echo ERROR in analysis.py && pause && exit /b 1 )

echo.
echo ============================================
echo  ML Pipeline Complete!
echo  Now start the API: python backend\api\app.py
echo ============================================
pause
