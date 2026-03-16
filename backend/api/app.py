"""
app.py
======
Flask REST API for the Delhi UHI Intelligence Platform.

Endpoints:
  GET  /api/health           — API health check
  GET  /api/stats            — Correlation + zone stats
  GET  /api/hotspots         — Heat risk zone breakdown
  GET  /api/recommendations  — Green corridor recommendations
  GET  /api/metrics          — ML model performance metrics
  GET  /api/map/<layer>      — Serve map PNGs (ndvi, uhi, prediction)
  POST /api/predict/pixel    — Predict risk for a single pixel value

Run: python backend/api/app.py
"""

import json
import os
from pathlib import Path
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

ROOT         = Path(__file__).resolve().parents[2]
DATA_OUTPUTS = ROOT / "data" / "outputs"
DATA_PROC    = ROOT / "data" / "processed"
DATA_RAW     = ROOT / "data" / "raw"

app = Flask(__name__)
CORS(app)   # Allow React frontend on port 3000


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def load_json(path):
    try:
        with open(path) as f:
            return json.load(f)
    except FileNotFoundError:
        return None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.route("/api/health")
def health():
    model_ready   = (DATA_OUTPUTS / "model.pkl").exists()
    data_ready    = (DATA_PROC / "X_features.npy").exists()
    predict_ready = (DATA_OUTPUTS / "heat_risk_map.npy").exists()

    return jsonify({
        "status": "ok",
        "model_trained":   model_ready,
        "data_processed":  data_ready,
        "prediction_done": predict_ready,
        "version": "1.0.0",
        "project": "Delhi UHI Intelligence Platform",
    })


@app.route("/api/stats")
def stats():
    data = load_json(DATA_PROC / "correlation_stats.json")
    if data is None:
        return jsonify({"error": "Run preprocess.py first"}), 404
    return jsonify(data)


@app.route("/api/hotspots")
def hotspots():
    data = load_json(DATA_OUTPUTS / "hotspot_stats.json")
    if data is None:
        return jsonify({"error": "Run predict.py first"}), 404
    return jsonify(data)


@app.route("/api/analysis")
def analysis():
    data = load_json(DATA_OUTPUTS / "full_analysis.json")
    if data is None:
        return jsonify({"error": "Run analysis.py first"}), 404
    return jsonify(data)


@app.route("/api/recommendations")
def recommendations():
    data = load_json(DATA_OUTPUTS / "full_analysis.json")
    if data is None:
        # Return static recommendations if analysis not run
        return jsonify([
            {
                "id": 1,
                "zone": "West Delhi — Dwarka/Najafgarh",
                "heat_class": "Very High (>45°C)",
                "recommendation": "Urban forest belt along Najafgarh Road",
                "estimated_cooling": "3–5°C",
                "priority": "Critical",
            },
            {
                "id": 2,
                "zone": "South West Industrial Corridor",
                "heat_class": "High (42–45°C)",
                "recommendation": "Tree corridors along NH-48 and Ring Road",
                "estimated_cooling": "2–4°C",
                "priority": "High",
            },
        ])
    return jsonify(data.get("recommendations", []))


@app.route("/api/metrics")
def metrics():
    data = load_json(DATA_OUTPUTS / "model_metrics.json")
    if data is None:
        return jsonify({"error": "Run train.py first"}), 404
    # Return key metrics only (no large confusion matrix by default)
    return jsonify({
        "model":        data.get("model"),
        "accuracy":     data.get("accuracy"),
        "f1_macro":     data.get("f1_macro"),
        "f1_weighted":  data.get("f1_weighted"),
        "cv_f1_mean":   data.get("cv_f1_mean"),
        "cv_f1_std":    data.get("cv_f1_std"),
        "training_pixels": data.get("training_pixels"),
        "test_pixels":     data.get("test_pixels"),
        "timestamp":    data.get("timestamp"),
    })


@app.route("/api/metrics/full")
def metrics_full():
    data = load_json(DATA_OUTPUTS / "model_metrics.json")
    if data is None:
        return jsonify({"error": "Run train.py first"}), 404
    return jsonify(data)


@app.route("/api/feature-importance")
def feature_importance():
    data = load_json(DATA_OUTPUTS / "feature_importance.json")
    if data is None:
        return jsonify({"error": "Run train.py first"}), 404
    return jsonify(data)


@app.route("/api/map/<layer>")
def serve_map(layer: str):
    """
    Serve map image files.
    layer: ndvi | uhi | prediction | analysis
    """
    MAP_FILES = {
        "ndvi":       DATA_RAW    / "DELHI_NDVI_MAP.png",
        "uhi":        DATA_RAW    / "DELHI_UHI_MAP.png",
        "prediction": DATA_OUTPUTS / "heat_risk_map_color.png",
        "analysis":   DATA_OUTPUTS / "analysis_report.png",
        "figure":     DATA_OUTPUTS / "heat_risk_figure.png",
    }

    path = MAP_FILES.get(layer)
    if path is None:
        return jsonify({"error": f"Unknown layer: {layer}"}), 400
    if not path.exists():
        return jsonify({"error": f"Map not generated yet for layer: {layer}"}), 404

    return send_file(str(path), mimetype="image/png")


@app.route("/api/predict/pixel", methods=["POST"])
def predict_pixel():
    """
    Predict heat risk for a single set of pixel values.
    Body: { "ndvi": 0.15, "temperature": 44.2, "lulc": 6 }
    """
    try:
        import joblib
        import numpy as np

        body = request.get_json()
        ndvi = float(body.get("ndvi", 0.15))
        temp  = float(body.get("temperature", 42.0))
        lulc  = int(body.get("lulc", 6))

        model_path = DATA_OUTPUTS / "model.pkl"
        if not model_path.exists():
            return jsonify({"error": "Model not trained yet"}), 503

        model  = joblib.load(model_path)
        X      = np.array([[ndvi, temp, lulc]])
        pred   = int(model.predict(X)[0])
        proba  = model.predict_proba(X)[0].tolist()

        labels = {
            1: "Very Low (<36°C)",
            2: "Low (36-39°C)",
            3: "Moderate (39-42°C)",
            4: "High (42-45°C)",
            5: "Very High (>45°C)",
        }

        return jsonify({
            "input":      {"ndvi": ndvi, "temperature": temp, "lulc": lulc},
            "prediction":  pred,
            "risk_label":  labels.get(pred, "Unknown"),
            "probability": proba,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/summary")
def summary():
    """One-shot endpoint for dashboard: all key data combined."""
    stats_data  = load_json(DATA_PROC / "correlation_stats.json") or {}
    hotspot_data = load_json(DATA_OUTPUTS / "hotspot_stats.json") or {}
    metrics_data = load_json(DATA_OUTPUTS / "model_metrics.json") or {}
    analysis_data = load_json(DATA_OUTPUTS / "full_analysis.json") or {}

    return jsonify({
        "stats":           stats_data,
        "hotspots":        hotspot_data,
        "model_metrics":   {
            "accuracy":  metrics_data.get("accuracy"),
            "f1_macro":  metrics_data.get("f1_macro"),
        },
        "recommendations": analysis_data.get("recommendations", []),
        "green_deficit":   analysis_data.get("green_deficit", {}),
    })


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n🌍 Delhi UHI Platform API")
    print(f"   Running on: http://localhost:{port}")
    print(f"   Docs: See README.md for endpoint list\n")
    app.run(host="0.0.0.0", port=port, debug=True)
