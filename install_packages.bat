@echo off
echo Installing Python packages for Python 3.13...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip --quiet
pip install numpy scipy scikit-learn pandas joblib
pip install opencv-python Pillow matplotlib seaborn
pip install flask flask-cors python-dotenv tqdm
echo.
echo All packages installed!
echo.
echo Now copy your data files to data\raw\ and run: run_pipeline.bat
pause
