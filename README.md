<div align="center">

```
███████╗██╗   ██╗██████╗ ██╗   ██╗ █████╗       ██████╗ ██████╗ ██╗███████╗ ██╗  ██╗████████╗ ██╗
██╔════╝██║   ██║██╔══██╗╚██╗ ██╔╝██╔══██╗      ██╔══██╗██╔══██╗██║██╔════╝ ██║  ██║╚══██╔══╝ ██║
███████╗██║   ██║██████╔╝ ╚████╔╝ ███████║ ████ ██║  ██║██████╔╝██║███████╗ ███████║   ██║    ██║
╚════██║██║   ██║██╔══██╗  ╚██╔╝  ██╔══██║      ██║  ██║██╔══██╗██║╚════██║ ██╔══██║   ██║    ██║
███████║╚██████╔╝██║  ██║   ██║   ██║  ██║      ██████╔╝██║  ██║██║███████║ ██║  ██║   ██║    ██║
╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝ ╚═╝  ╚═╝   ╚═╝    ╚═╝
```

**सूर्यदृष्टि — Sun Vision**

*AI-Powered Urban Heat Island Mapping & Green Space Intelligence Platform*

---

[![Live Platform](https://img.shields.io/badge/Platform-Live-brightgreen?style=flat-square&logo=vercel)](https://surya-drishti.vercel.app)
[![API Status](https://img.shields.io/badge/API-Online-brightgreen?style=flat-square&logo=render)](https://suryadrishti-api.onrender.com/api/health)
[![Model Accuracy](https://img.shields.io/badge/Accuracy-95.99%25-blue?style=flat-square&logo=scikit-learn)](https://suryadrishti-api.onrender.com/api/metrics)
[![F1 Score](https://img.shields.io/badge/F1%20Macro-0.962-blue?style=flat-square)](https://suryadrishti-api.onrender.com/api/metrics)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![ISRO](https://img.shields.io/badge/Aligned-NRSC%2FISRO-orange?style=flat-square)](https://nrsc.gov.in)

---

**Data Source:** Landsat 9 OLI/TIRS · April 2025 · USGS Earth Explorer  
**Study Area:** National Capital Territory of Delhi, India  
**GIS Processing:** Chandreyee Dey Roy  
**ML + Full-Stack System:** Nitanshu Tak

</div>

---

## Table of Contents

- [Overview](#overview)
- [Scientific Background](#scientific-background)
- [Project Architecture](#project-architecture)
- [Data Pipeline](#data-pipeline)
- [Machine Learning System](#machine-learning-system)
- [Key Results](#key-results)
- [REST API Reference](#rest-api-reference)
- [Dashboard Components](#dashboard-components)
- [Deployment](#deployment)
- [Local Setup](#local-setup)
- [Repository Structure](#repository-structure)
- [Technology Stack](#technology-stack)
- [Research Alignment](#research-alignment)
- [Contributors](#contributors)
- [License](#license)

---

## Overview

SuryaDrishti (*Sanskrit: सूर्यदृष्टि — Sun Vision*) is a production-grade geospatial intelligence platform that quantifies, predicts, and visualises Urban Heat Island (UHI) intensity across Delhi using multi-spectral satellite imagery from Landsat 9.

The system constructs an end-to-end pipeline from raw GeoTIFF satellite data through machine learning classification to a publicly deployed interactive web dashboard — making satellite-derived urban climate intelligence operationally accessible without specialist GIS software.

**The platform addresses a critical gap:** while high-resolution thermal remote sensing data is freely available, no accessible AI-enhanced decision support system existed for Delhi's urban heat risk. SuryaDrishti closes that gap.

### Live Deployments

| Component | URL | Stack |
|---|---|---|
| Interactive Dashboard | [surya-drishti.vercel.app](https://surya-drishti.vercel.app) | React 18 · Vercel Edge CDN |
| REST API | [suryadrishti-api.onrender.com](https://suryadrishti-api.onrender.com/api/health) | Flask · Gunicorn · Render |
| Source Code | [github.com/Nitanshu715/SuryaDrishti](https://github.com/Nitanshu715/SuryaDrishti) | Python · JavaScript |

---

## Scientific Background

### Urban Heat Island Effect

The Urban Heat Island (UHI) effect describes the measurable temperature elevation of urban areas relative to surrounding rural environments. The primary drivers are:

- **Impervious surface dominance** — Concrete, asphalt, and roofing materials exhibit high thermal mass and low albedo, absorbing and re-radiating solar energy as longwave thermal radiation
- **Vegetation removal** — Eliminates latent heat flux via evapotranspiration, the dominant surface energy dissipation mechanism in natural landscapes
- **Anthropogenic heat** — Building HVAC systems, vehicles, and industrial processes inject thermal energy directly into the urban boundary layer
- **Urban canyon geometry** — Street canyons reduce sky view factor, trapping longwave radiation and suppressing convective cooling

### Why Delhi

Delhi presents a critical UHI study case:

- Population of ~33.8 million with population density exceeding 11,000 persons/km²
- Built-up land cover constitutes approximately 68% of the spatial extent
- April surface temperatures routinely exceed 45°C in dense urban cores
- Green cover at approximately 20% — far below WHO recommended 9m² per capita
- Rapid urbanisation trajectory continues with Master Plan 2041 projecting further expansion

### Remote Sensing Approach

Land Surface Temperature (LST) retrieval follows the standard Landsat thermal processing chain:

```
DN (Digital Numbers)
      |
      v
TOA Spectral Radiance  [L = ML * Qcal + AL]
      |
      v
TOA Brightness Temperature  [T = K2 / ln(K1/L + 1)]
      |
      v
Emissivity Correction  [e = 0.004 * Pv + 0.986]
      |
      v
Land Surface Temperature  [LST = BT / (1 + (λ·BT/ρ)·ln(e))]
```

NDVI is computed from Landsat 9 surface reflectance:

```
NDVI = (Band 5 NIR − Band 4 Red) / (Band 5 NIR + Band 4 Red)
```

Range: −1.0 (water/cloud) → 0.0 (bare soil) → +1.0 (dense vegetation)  
Delhi April 2025 range: `0.000 → 0.393`

---

## Project Architecture

```
                    ┌─────────────────────────────────────────────┐
                    │          SATELLITE DATA LAYER               │
                    │   Landsat 9 OLI/TIRS  ·  April 2025       │
                    │   Band 4 · Band 5 · Band 10                │
                    └──────────────────┬──────────────────────────┘
                                       │
                    ┌──────────────────v──────────────────────────┐
                    │          GIS PROCESSING LAYER               │
                    │   QGIS · Rasterio · GDAL · OpenCV          │
                    │   NDVI Map · LST Map · LULC Classification  │
                    └──────────────────┬──────────────────────────┘
                                       │  GeoTIFF (.tif) rasters
                    ┌──────────────────v──────────────────────────┐
                    │          ML INTELLIGENCE LAYER              │
                    │   preprocess.py  →  train.py               │
                    │   predict.py     →  analysis.py            │
                    │   Random Forest · 1,458,068 pixels         │
                    │   Accuracy: 95.99%  ·  F1: 0.962           │
                    └──────────────────┬──────────────────────────┘
                                       │  model.pkl · JSON outputs
                    ┌──────────────────v──────────────────────────┐
                    │          REST API LAYER                     │
                    │   Flask 3.0 · Gunicorn · 10 endpoints      │
                    │   suryadrishti-api.onrender.com             │
                    └──────────┬──────────────────────────────────┘
                               │  JSON · PNG tiles
                    ┌──────────v──────────────────────────────────┐
                    │          PRESENTATION LAYER                 │
                    │   React 18 · Chart.js · 7 components       │
                    │   surya-drishti.vercel.app                  │
                    └─────────────────────────────────────────────┘
```

---

## Data Pipeline

### Input Data Files

Place the following GeoTIFF files in `data/raw/` before running the pipeline:

| File | Bands | Description | Source |
|---|---|---|---|
| `DELHI NDVI MAP.tif` | Band 4, 5 | Vegetation index raster | Landsat 9 OLI |
| `DELHI TEMPERATURE MAP.tif` | Band 10 | Land surface temperature | Landsat 9 TIRS |
| `DELHI UHI MAP.tif` | Derived | Classified heat zones (1–5) | QGIS derived |
| `DELHI LULC.tiff` | Multi-band | Land use/land cover (7 classes) | Supervised classification |

### Pipeline Execution

```bash
# Step 1 — Preprocess: load rasters, align grids, extract pixel features
python backend/ml/preprocess.py

# Step 2 — Train: fit Random Forest on 1.4M pixel observations
python backend/ml/train.py

# Step 3 — Predict: run full-scene inference, generate heat risk map
python backend/ml/predict.py

# Step 4 — Analyse: correlation, LULC stats, green deficit, recommendations
python backend/ml/analysis.py
```

### Feature Engineering

Each pixel in the co-registered raster stack constitutes one training observation:

```python
# Feature matrix: (N_pixels, 3)
X = np.column_stack([
    ndvi_flat[valid],      # Continuous: 0.000 – 0.393
    temp_flat[valid],      # Continuous: 30.3 – 51.4 °C
    lulc_flat[valid],      # Categorical integer: 1 – 7
])

# Target vector: UHI heat zone class (1 – 5)
y = uhi_flat[valid]
```

Total observations after nodata masking: **1,458,068 pixels**

### LULC Class Definitions

| Class ID | Label | Avg LST (°C) | Coverage |
|---|---|---|---|
| 1 | Water Bodies | ~33.0 | ~3% |
| 2 | Trees | ~37.5 | ~4% |
| 3 | Grassland | ~39.5 | ~5% |
| 4 | Cropland | ~41.1 | ~8% |
| 5 | Shrub | ~42.0 | ~4% |
| 6 | Built-up Area | ~43.5 | ~68% |
| 7 | Bare Ground | ~44.6 | ~8% |

---

## Machine Learning System

### Model Selection

Random Forest was selected over alternative classifiers (SVM, Gradient Boosting, Neural Networks) based on:

- Superior handling of class imbalance via `class_weight='balanced'`
- Native feature importance quantification
- No assumption of feature distribution (non-parametric)
- Robustness to outliers and noise in satellite-derived features
- Demonstrated state-of-art performance in remote sensing classification literature (Belgiu & Dragut, 2016)

### Hyperparameter Configuration

```python
from sklearn.ensemble import RandomForestClassifier

model = RandomForestClassifier(
    n_estimators    = 150,       # Number of trees
    max_depth       = 12,        # Maximum tree depth
    min_samples_split = 20,      # Minimum samples to split a node
    min_samples_leaf  = 10,      # Minimum samples in a leaf
    class_weight    = "balanced", # Compensate for class imbalance
    n_jobs          = -1,        # Use all available CPU cores
    random_state    = 42,        # Reproducibility seed
)
```

### Training Protocol

```
Dataset: 1,458,068 valid pixels
      |
      v
Balanced Downsampling (max 50,000 per class)
Balanced Dataset: 189,596 pixels
      |
      v
Stratified 80/20 Train/Test Split
Train: 151,676   |   Test: 37,920
      |
      v
Model Fit on Training Set
      |
      v
Test Set Evaluation + 5-Fold Cross-Validation
```

### Performance Metrics

| Metric | Value |
|---|---|
| **Overall Accuracy** | **95.99%** |
| F1 Score (Macro) | 0.9620 |
| F1 Score (Weighted) | 0.9599 |
| Cross-Validation F1 (5-fold mean) | 0.9630 |
| Cross-Validation F1 (std dev) | ± 0.0007 |
| Training pixels | 151,676 |
| Test pixels | 37,920 |

### Feature Importance

| Feature | Importance | Interpretation |
|---|---|---|
| Temperature (°C) | 85.24% | Primary thermal signal; directly defines heat zones |
| LULC Class | 11.01% | Land cover type modulates thermal behaviour |
| NDVI | 3.74% | Vegetation density provides supplementary signal |

Temperature dominates as expected — LST is the direct physical signal from which heat zones are defined. LULC provides class-level thermal context; NDVI adds vegetation-specific cooling signal.

### Heat Zone Classification

| Class | Label | Temperature Range | Predicted Coverage |
|---|---|---|---|
| 1 | Very Low | < 36°C | 2.7% |
| 2 | Low | 36 – 39°C | 0.0% |
| 3 | Moderate | 39 – 42°C | 71.4% |
| 4 | High | 42 – 45°C | 18.4% |
| 5 | Very High | > 45°C | 7.5% |

**Critical finding:** Classes 4 + 5 combined = **25.9%** of Delhi (~384 km²) experiencing extreme surface heat stress.

---

## Key Results

### NDVI – Temperature Correlation

```
Pearson r  =  −0.110   (p < 0.05, statistically significant)
```

Negative correlation confirms: higher vegetation density correlates with lower surface temperature.

| Vegetation Stratum | Avg LST (°C) |
|---|---|
| Very Low NDVI (< Q25) | 44.62°C |
| Low NDVI (Q25 – Q50) | 41.96°C |
| Moderate NDVI (Q50 – Q75) | 41.11°C |
| High NDVI (> Q75) | 37.50°C |

**Temperature differential between lowest and highest NDVI quartiles: 7.1°C**

This quantifies the urban cooling potential of vegetation — a 7.1°C surface temperature reduction achievable through targeted greening of deficit zones.

### Green Space Deficit

```
Deficit Zone Definition:
  NDVI < 25th percentile  AND  LST > 75th percentile

Result:
  6.04% of Delhi = priority greening zone
  Estimated area: ~90 km²
```

### Green Corridor Recommendations

| Priority | Zone | Recommendation | Est. Cooling |
|---|---|---|---|
| Critical | West Delhi — Dwarka/Najafgarh | Urban forest belt along Najafgarh Road | 3 – 5°C |
| High | SW Industrial — NH-48 | Tree corridors along Outer Ring Road and NH-48 | 2 – 4°C |
| High | Central Delhi — Dense Core | Rooftop gardens + pocket parks in municipal wards | 1 – 2°C |
| Medium | North Delhi — Industrial | Green buffer zones around industrial cluster perimeters | 2 – 3°C |
| Preserve | Yamuna Floodplain | Preserve and expand riparian vegetation and wetlands | Baseline |

---

## REST API Reference

Base URL: `https://suryadrishti-api.onrender.com`

### Endpoints

#### `GET /api/health`
System status and readiness check.

```json
{
  "status": "ok",
  "model_trained": true,
  "data_processed": true,
  "prediction_done": true,
  "project": "Delhi UHI Intelligence Platform",
  "version": "1.0.0"
}
```

#### `GET /api/hotspots`
Heat risk zone pixel counts and spatial coverage percentages.

```json
{
  "total_valid_pixels": 1458068,
  "zones": [
    { "class": 1, "label": "Very Low (<36°C)", "pixel_count": 39605, "percentage": 2.7 },
    { "class": 3, "label": "Moderate (39-42°C)", "pixel_count": 1041364, "percentage": 71.4 },
    { "class": 4, "label": "High (42-45°C)", "pixel_count": 268072, "percentage": 18.4 },
    { "class": 5, "label": "Very High (>45°C)", "pixel_count": 109027, "percentage": 7.5 }
  ],
  "critical_coverage_pct": 7.5
}
```

#### `GET /api/stats`
NDVI–temperature correlation statistics.

```json
{
  "ndvi_temp_correlation": -0.11,
  "ndvi_range": [0.0, 0.393],
  "temp_range": [30.3, 51.4],
  "avg_temp_by_vegetation_density": {
    "very_low_vegetation": 44.62,
    "low_vegetation": 41.96,
    "moderate_vegetation": 41.11,
    "high_vegetation": 37.50
  },
  "total_valid_pixels": 1458068
}
```

#### `GET /api/metrics`
ML model performance summary.

```json
{
  "model": "RandomForestClassifier",
  "accuracy": 0.9599,
  "f1_macro": 0.9620,
  "f1_weighted": 0.9599,
  "cv_f1_mean": 0.9630,
  "cv_f1_std": 0.0007,
  "training_pixels": 151676,
  "test_pixels": 37920
}
```

#### `GET /api/analysis`
Full scientific analysis: correlation, LULC heat, green deficit, recommendations.

#### `GET /api/recommendations`
Evidence-based green corridor intervention recommendations array.

#### `GET /api/map/<layer>`
Serve satellite map PNG tiles. `layer` must be one of: `uhi`, `ndvi`, `prediction`.

```
GET /api/map/uhi         → Urban Heat Island zones map (PNG)
GET /api/map/ndvi        → NDVI vegetation map (PNG)
GET /api/map/prediction  → AI predicted heat risk map (PNG)
```

#### `GET /api/summary`
Single aggregated endpoint for dashboard initialisation — returns all key data in one request.

#### `GET /api/feature-importance`
Random Forest feature importance scores.

```json
{
  "NDVI": 0.0374,
  "Temperature (°C)": 0.8524,
  "LULC Class": 0.1101
}
```

#### `POST /api/predict/pixel`
Live heat risk inference for arbitrary pixel values.

**Request body:**
```json
{
  "ndvi": 0.08,
  "temperature": 44.5,
  "lulc": 6
}
```

**Response:**
```json
{
  "input": { "ndvi": 0.08, "temperature": 44.5, "lulc": 6 },
  "prediction": 5,
  "risk_label": "Very High (>45°C)",
  "probability": [0.01, 0.02, 0.04, 0.08, 0.85]
}
```

---

## Dashboard Components

The React frontend (`surya-drishti.vercel.app`) comprises seven purpose-built components:

| Component | File | Description |
|---|---|---|
| `Dashboard` | `pages/Dashboard.js` | Root layout, data fetching, state management |
| `StatCard` | `components/StatCard.js` | KPI cards: Very High%, High%, r, Deficit% |
| `MapViewer` | `components/MapViewer.js` | Satellite map layer switcher (UHI / NDVI / AI) |
| `HeatZoneChart` | `components/HeatZoneChart.js` | Doughnut chart: zone distribution |
| `CorrelationPanel` | `components/CorrelationPanel.js` | Bar chart + LULC heat table |
| `ModelMetrics` | `components/ModelMetrics.js` | Accuracy / F1 progress bars |
| `PixelPredictor` | `components/PixelPredictor.js` | Live inference UI via `/api/predict/pixel` |
| `RecommendationsPanel` | `components/RecommendationsPanel.js` | Green corridor recommendation cards |

All components call `https://suryadrishti-api.onrender.com` directly (CORS enabled) — no proxy dependency.

---

## Deployment

### Backend — Render

The Flask API is deployed as a Python 3.11 web service on Render (Virginia, US East).

**Configuration:**

| Setting | Value |
|---|---|
| Runtime | Python 3.11 |
| Build Command | `pip install numpy scipy scikit-learn pandas joblib opencv-python Pillow matplotlib seaborn flask flask-cors python-dotenv tqdm gunicorn` |
| Start Command | `gunicorn backend.api.app:app --bind 0.0.0.0:$PORT` |
| Instance Type | Free (512MB RAM, 0.1 CPU) |
| Auto-deploy | On push to `main` |

### Frontend — Vercel

The React dashboard is deployed on Vercel's global edge network.

**Configuration:**

| Setting | Value |
|---|---|
| Framework | Create React App |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Auto-deploy | On push to `main` |

### CI/CD Pipeline

```
git push origin main
        |
        v
GitHub Actions (.github/workflows/ci.yml)
        |
        ├── backend-test    (pytest + flake8)
        ├── frontend-build  (npm install + npm run build)
        └── docker-build    (docker build, main branch only)
        |
        v
Render  → Auto-redeploy backend
Vercel  → Auto-redeploy frontend
```

---

## Local Setup

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.11+ | Python 3.13 supported |
| Node.js | 18+ | For React frontend |
| Git | Any | Version control |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Nitanshu715/SuryaDrishti.git
cd SuryaDrishti

# 2. Create and activate Python virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / macOS
source venv/bin/activate

# 3. Install Python dependencies
pip install numpy scipy scikit-learn pandas joblib
pip install opencv-python Pillow matplotlib seaborn
pip install flask flask-cors python-dotenv tqdm

# 4. Install frontend dependencies
cd frontend
npm install
cd ..
```

### Data Files

Place GeoTIFF and PNG files from Landsat 9 processing in `data/raw/`:

```
data/raw/
├── DELHI NDVI MAP.tif
├── DELHI TEMPERATURE MAP.tif
├── DELHI UHI MAP.tif
├── DELHI LULC.tiff
├── DELHI_NDVI_MAP.png        (for dashboard display)
└── DELHI_UHI_MAP.png         (for dashboard display)
```

### Running the Full System

```bash
# Terminal 1 — Run ML pipeline (one-time)
python backend/ml/preprocess.py
python backend/ml/train.py
python backend/ml/predict.py
python backend/ml/analysis.py

# Terminal 2 — Start Flask API
python backend/api/app.py
# API running at http://localhost:5000

# Terminal 3 — Start React dashboard
cd frontend
npm start
# Dashboard at http://localhost:3000
```

Verify API health:
```bash
curl http://localhost:5000/api/health
```

---

## Repository Structure

```
SuryaDrishti/
├── backend/
│   ├── api/
│   │   ├── app.py               Flask REST API — 10 endpoints
│   │   └── __init__.py
│   ├── ml/
│   │   ├── preprocess.py        Raster loading, alignment, feature extraction
│   │   ├── train.py             Random Forest training + cross-validation
│   │   ├── predict.py           Full-scene inference, heat risk map generation
│   │   ├── analysis.py          Correlation, LULC heat, green deficit, recommendations
│   │   └── __init__.py
│   └── __init__.py
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js     Root dashboard page
│   │   │   └── Dashboard.css
│   │   ├── components/
│   │   │   ├── StatCard.js
│   │   │   ├── MapViewer.js
│   │   │   ├── HeatZoneChart.js
│   │   │   ├── CorrelationPanel.js
│   │   │   ├── ModelMetrics.js
│   │   │   ├── PixelPredictor.js
│   │   │   └── RecommendationsPanel.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── data/
│   ├── raw/                     Place GeoTIFF source files here (gitignored)
│   ├── processed/               Generated numpy arrays (gitignored)
│   └── outputs/
│       ├── model.pkl            Trained Random Forest model
│       ├── model_metrics.json   Accuracy, F1, confusion matrix
│       ├── hotspot_stats.json   Zone pixel counts and coverage
│       ├── full_analysis.json   Correlation, LULC heat, green deficit
│       ├── feature_importance.json
│       ├── heat_risk_figure.png AI-generated prediction map
│       └── analysis_report.png 4-panel scientific analysis figure
├── docs/
│   └── architecture.md          System architecture documentation
├── screenshots/                 Dashboard screenshots
├── .github/
│   └── workflows/
│       └── ci.yml               GitHub Actions CI/CD pipeline
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── setup.bat                    Windows one-click setup
├── run_pipeline.bat             Windows ML pipeline runner
└── README.md
```

---

## Technology Stack

### Backend & ML

| Library | Version | Role |
|---|---|---|
| Python | 3.11 | Core language |
| scikit-learn | 1.5.0 | Random Forest classifier, metrics |
| NumPy | 2.0+ | Array operations, raster math |
| Pandas | 2.2+ | Tabular data processing |
| SciPy | 1.13+ | Statistical analysis (Pearson r) |
| Rasterio | 1.3+ | GeoTIFF I/O (optional, fallback to Pillow) |
| OpenCV | 4.9+ | Image processing, raster alignment |
| Pillow | 10+ | PNG/TIFF image handling |
| Matplotlib | 3.8+ | Scientific figure generation |
| joblib | 1.4+ | Model serialisation |
| Flask | 3.0 | REST API framework |
| Flask-CORS | 4.0 | Cross-origin resource sharing |
| Gunicorn | 21+ | Production WSGI server |

### Frontend

| Library | Version | Role |
|---|---|---|
| React | 18.2 | Component framework |
| Chart.js | 4.4 | Doughnut and bar charts |
| react-chartjs-2 | 5.2 | React Chart.js bindings |
| Leaflet | 1.9 | Interactive mapping (optional) |
| Lucide React | 0.363 | Icon components |
| Axios | 1.6 | HTTP client |

### Infrastructure

| Service | Role |
|---|---|
| Render | Backend API hosting (Python PaaS) |
| Vercel | Frontend hosting (Edge CDN) |
| GitHub Actions | CI/CD pipeline |
| Docker | Containerisation |

---

## Research Alignment

SuryaDrishti is methodologically aligned with NRSC/ISRO operational workflows:

| NRSC Programme | Alignment |
|---|---|
| National Land Use Land Cover Mapping | LULC classification methodology mirrors NRSC's Bhuvan classification scheme |
| Urban Heat Island Studies (GHSL) | LST retrieval protocol follows NRSC Landsat thermal processing standards |
| National Urban Information System (NUIS) | Ward-level heat risk mapping supports NUIS urban analytics objectives |
| Green Cover Monitoring Programme | Green deficit analysis outputs actionable data for DDA urban forestry |
| Smart Cities Mission | Platform provides accessible climate intelligence for Smart City planners |

### Applicable Standards

- **USGS Landsat Collection 2 Level-2 Science Products** — LST algorithm reference
- **NRSC LULC Classification Scheme** — 7-class land cover taxonomy
- **IMD Urban Heat Island Monitoring Protocol** — Temperature threshold definitions
- **Delhi Master Plan 2041 (MPD-2041)** — Green corridor intervention framework

---

## Contributors

| Contributor | Role |
|---|---|
| **Nitanshu Tak** | ML pipeline, Flask API, React dashboard, CI/CD, deployment |
| **Chandreyee Dey Roy** | GIS processing, NDVI computation, LST retrieval, LULC classification, QGIS map generation |

**Data Source:** Landsat 9 OLI/TIRS imagery — USGS Earth Explorer — April 2025  
**Satellite:** Landsat 9 (launched September 27, 2021 · Sun-synchronous orbit · 705 km altitude)

---

## Citation

If you use this work, please cite:

```
Tak, N. and Dey Roy, C. (2026). SuryaDrishti: AI-Powered Urban Heat Island Mapping
and Green Space Intelligence Platform for Delhi, India.
GitHub: https://github.com/Nitanshu715/SuryaDrishti
```

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for full terms.

```
MIT License — Copyright (c) 2026 Nitanshu Tak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software.
```

---

<div align="center">

**SuryaDrishti · सूर्यदृष्टि**

*Built with Landsat 9 · scikit-learn · Flask · React*  
*Aligned with NRSC/ISRO Urban Climate Monitoring Workflows*

[surya-drishti.vercel.app](https://surya-drishti.vercel.app) · [API](https://suryadrishti-api.onrender.com/api/health) · [GitHub](https://github.com/Nitanshu715/SuryaDrishti)

</div>
