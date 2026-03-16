# 🌍 Delhi Urban Heat Island Intelligence Platform

**AI-Powered Urban Heat Island Mapping & Green Space Analysis System**  
*Built for ISRO/NRSC internship portfolio*

---

## 📌 Project Summary

This platform uses **satellite imagery from Landsat 9** (April 2025) to analyze Delhi's Urban Heat Island effect. It combines remote sensing data (NDVI, LST, LULC) with a **machine learning pipeline** to predict heat risk zones and recommend green corridor placements — all exposed via a REST API and interactive web dashboard.

**Data Source:** Landsat 9 OLI/TIRS | April 2025  
**Prepared by:** CHANDREYEE DEY ROY (GIS layers)  
**ML + System:** [Your Name]

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| ML / AI | Python, scikit-learn, NumPy, OpenCV |
| Geo Processing | Rasterio, GDAL, GeoPandas |
| Backend API | Flask, REST |
| Frontend | React, Leaflet.js, Chart.js |
| DevOps | Docker, GitHub Actions |
| Data | Landsat 9 GeoTIFF rasters |

---

## 📁 Project Structure

```
delhi-uhi-platform/
├── backend/
│   ├── ml/
│   │   ├── preprocess.py        # Load + align GeoTIFF rasters
│   │   ├── train.py             # Train Random Forest heat risk model
│   │   ├── predict.py           # Generate heat risk prediction map
│   │   └── analysis.py          # Correlation + hotspot statistics
│   ├── api/
│   │   ├── app.py               # Flask REST API
│   │   └── routes.py            # API endpoints
│   └── utils/
│       └── helpers.py           # Shared utilities
├── frontend/
│   └── src/
│       ├── components/          # React components
│       └── pages/               # Dashboard pages
├── data/
│   ├── raw/                     # Place your .tif files here
│   ├── processed/               # Generated numpy arrays
│   └── outputs/                 # Model predictions + maps
├── notebooks/
│   └── eda.ipynb                # Exploratory analysis
├── docs/
│   └── architecture.md
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## 🚀 Quick Start (Windows CMD)

### Step 1 — Clone & Setup
```cmd
git clone https://github.com/YOUR_USERNAME/delhi-uhi-platform.git
cd delhi-uhi-platform
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Step 2 — Add Data Files
Place your GeoTIFF files in `data/raw/`:
```
data/raw/DELHI_NDVI_MAP.tif
data/raw/DELHI_TEMPERATURE_MAP.tif
data/raw/DELHI_UHI_MAP.tif
data/raw/DELHI_LULC.tiff
```

### Step 3 — Run ML Pipeline
```cmd
python backend/ml/preprocess.py
python backend/ml/train.py
python backend/ml/predict.py
```

### Step 4 — Start API
```cmd
python backend/api/app.py
```
API runs at: http://localhost:5000

### Step 5 — Start Frontend
```cmd
cd frontend
npm install
npm start
```
Dashboard at: http://localhost:3000

---

## 📊 ML Pipeline

```
GeoTIFF Rasters (NDVI + Temperature + LULC)
        ↓
Pixel-wise feature extraction
        ↓
Random Forest Classifier
        ↓
Heat Risk Prediction (5 classes)
        ↓
GeoTIFF output + API + Dashboard
```

**Model:** Random Forest (100 estimators)  
**Features:** NDVI value, Surface Temperature, Land Cover class  
**Target:** Heat Risk Level (Very Low → Very High)  
**Metrics:** Accuracy, F1-score, Confusion Matrix  

---

## 📈 Output Products

- `outputs/heat_risk_map.tif` — Predicted heat risk raster  
- `outputs/hotspots.geojson` — High-risk zone polygons  
- `outputs/correlation_stats.json` — NDVI vs Temperature stats  
- `outputs/model_metrics.json` — ML performance metrics  
- Interactive dashboard with layer toggling  

---

## 🎯 Research Alignment

This project aligns with NRSC/ISRO workflows for:
- Urban climate monitoring
- Land surface temperature analysis
- Green space planning
- Satellite-based environmental assessment

---

## 📝 License
MIT License
