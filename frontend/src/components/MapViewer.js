import React, { useState } from "react";
import "./MapViewer.css";

const LAYER_INFO = {
  uhi: {
    label: "Urban Heat Island Zones",
    description: "Surface temperature classified into 5 heat risk zones (Landsat 9 Thermal Band)",
    legend: [
      { color: "#00008B", label: "Very Low  <36°C" },
      { color: "#6495ED", label: "Low  36–39°C" },
      { color: "#90EE90", label: "Moderate  39–42°C" },
      { color: "#FFA500", label: "High  42–45°C" },
      { color: "#DC143C", label: "Very High  >45°C" },
    ],
  },
  ndvi: {
    label: "NDVI — Vegetation Index",
    description: "Normalized Difference Vegetation Index derived from NIR + Red bands",
    legend: [
      { color: "#8B0000", label: "0.000 — No vegetation" },
      { color: "#F4A460", label: "0.100 — Sparse" },
      { color: "#FAFAD2", label: "0.200 — Low" },
      { color: "#90EE90", label: "0.300 — Moderate" },
      { color: "#006400", label: "0.400+ — Dense" },
    ],
  },
  prediction: {
    label: "AI Predicted Heat Risk Map",
    description: "Random Forest model prediction · Accuracy 95.99% · F1 0.962",
    legend: [
      { color: "#00008B", label: "Very Low" },
      { color: "#6495ED", label: "Low" },
      { color: "#90EE90", label: "Moderate" },
      { color: "#FFA500", label: "High" },
      { color: "#DC143C", label: "Very High" },
    ],
  },
};

export default function MapViewer({ layer, apiBase = "https://suryadrishti-api.onrender.com" }) {
  const [imgError, setImgError] = useState(false);
  const info = LAYER_INFO[layer] || LAYER_INFO.uhi;
  const imgSrc = `${apiBase}/api/map/${layer}`;

  return (
    <div className="map-viewer">
      <div className="map-img-wrap">
        {imgError ? (
          <div className="map-placeholder">
            <div className="placeholder-inner">
              <span className="placeholder-icon">🗺️</span>
              <p className="placeholder-title">{info.label}</p>
              <p className="placeholder-sub">
                {layer === "prediction"
                  ? "Run predict.py to generate AI prediction map"
                  : "Map image not found in data/raw/"}
              </p>
              <code className="placeholder-cmd">
                python backend/ml/{layer === "prediction" ? "predict" : "preprocess"}.py
              </code>
            </div>
          </div>
        ) : (
          <img
            src={imgSrc}
            alt={info.label}
            className="map-img"
            onError={() => setImgError(true)}
          />
        )}
        <div className="map-legend">
          <div className="legend-title mono">INDEX</div>
          {info.legend.map((item, i) => (
            <div key={i} className="legend-row">
              <span className="legend-swatch" style={{ background: item.color }} />
              <span className="legend-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="map-info-bar">
        <span className="map-info-label">{info.label}</span>
        <span className="map-info-desc muted">{info.description}</span>
      </div>
    </div>
  );
}
