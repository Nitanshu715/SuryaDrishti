# System Architecture — Delhi UHI Intelligence Platform

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SATELLITE DATA LAYER                          │
│  Landsat 9 OLI/TIRS · April 2025 · USGS/Copernicus             │
│  Bands: Band 4 (Red) · Band 5 (NIR) · Band 10 (Thermal)        │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GIS PROCESSING LAYER                          │
│  Tool: QGIS + Rasterio + GDAL                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  NDVI Map    │  │ LST / UHI    │  │   LULC Classification│  │
│  │  (NIR-R/NIR  │  │  Map (Band10)│  │   (7 classes)        │  │
│  │  +R)         │  │              │  │                      │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         └─────────────────┴──────────────────────┘             │
│                            │                                    │
│                   GeoTIFF (.tif) files                          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ML PIPELINE                                   │
│                                                                 │
│  preprocess.py                                                  │
│    └─ Load rasters → align grids → extract pixel features       │
│       Output: X_features.npy  (N_pixels × 3 features)          │
│               y_labels.npy    (N_pixels UHI class labels)       │
│                                                                 │
│  train.py                                                       │
│    └─ Random Forest (150 trees, class_weight=balanced)          │
│       Features: [NDVI, Temperature, LULC]                       │
│       Target:   Heat Zone (1–5)                                 │
│       Output:   model.pkl · model_metrics.json                  │
│                                                                 │
│  predict.py                                                     │
│    └─ Full Delhi prediction → colorized map PNG                 │
│       Output: heat_risk_map.npy · heat_risk_map_color.png       │
│               hotspot_stats.json                                │
│                                                                 │
│  analysis.py                                                    │
│    └─ Pearson correlation · LULC heat stats · green deficit     │
│       Output: full_analysis.json · analysis_report.png          │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REST API (Flask)                              │
│  backend/api/app.py · port 5000                                 │
│                                                                 │
│  GET  /api/health            → system status                    │
│  GET  /api/stats             → correlation stats                │
│  GET  /api/hotspots          → zone breakdown                   │
│  GET  /api/analysis          → full analysis results            │
│  GET  /api/recommendations   → green corridor plan              │
│  GET  /api/metrics           → ML model performance             │
│  GET  /api/map/<layer>       → serve map PNG images             │
│  GET  /api/summary           → all data combined                │
│  POST /api/predict/pixel     → live pixel inference             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REACT DASHBOARD                               │
│  frontend/  · port 3000                                         │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HEADER: project name · API status · data badge          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  STAT CARDS: Very High% · High% · Cool% · r · Deficit%  │   │
│  ├───────────────────────────┬──────────────────────────────┤   │
│  │  MAP VIEWER               │  HEAT ZONE DOUGHNUT CHART    │   │
│  │  (UHI / NDVI / AI map)    ├──────────────────────────────┤   │
│  │  with legend overlay      │  ML MODEL METRICS            │   │
│  ├───────────────────────────┼──────────────────────────────┤   │
│  │  CORRELATION PANEL        │  LIVE PIXEL PREDICTOR        │   │
│  │  (bar chart + LULC table) │  (sliders → API → result)    │   │
│  ├───────────────────────────┴──────────────────────────────┤   │
│  │  GREEN CORRIDOR RECOMMENDATIONS (5 cards)                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
.tif files → preprocess.py → .npy arrays
                                  │
                                  ▼
                            train.py → model.pkl
                                  │
                                  ▼
                          predict.py → heat_risk_map.npy
                                  │         + color PNG
                                  ▼
                          analysis.py → full_analysis.json
                                  │
                                  ▼
                          Flask API (/api/*)
                                  │
                                  ▼
                        React Dashboard (localhost:3000)
```

## ML Model Details

| Property | Value |
|---|---|
| Algorithm | Random Forest Classifier |
| Trees | 150 (n_estimators) |
| Max depth | 12 |
| Class weights | Balanced (handles imbalanced zones) |
| Train/test split | 80/20 stratified |
| Cross-validation | 5-fold |
| Features | NDVI, Temperature, LULC class |
| Target classes | 5 UHI heat zones |
| Key metric | F1 Macro (handles class imbalance) |

## Research Outputs

1. `data/outputs/model_metrics.json` — Accuracy, F1, confusion matrix
2. `data/outputs/full_analysis.json` — Correlation r, LULC stats, green deficit
3. `data/outputs/hotspot_stats.json` — Zone coverage percentages
4. `data/outputs/heat_risk_figure.png` — Publication-quality map
5. `data/outputs/analysis_report.png` — 4-panel scientific figure

These outputs form the basis of a research paper methodology section.
