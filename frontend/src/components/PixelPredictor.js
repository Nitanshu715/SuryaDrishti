import React, { useState } from "react";
import "./PixelPredictor.css";

const LULC_OPTIONS = [
  { id: 1, label: "Water Bodies" },
  { id: 2, label: "Trees" },
  { id: 3, label: "Grassland" },
  { id: 4, label: "Cropland" },
  { id: 5, label: "Shrub" },
  { id: 6, label: "Buildup Area" },
  { id: 7, label: "Bare Ground" },
];

const RISK_META = {
  1: { label: "Very Low",  color: "#00008B", emoji: "🟦" },
  2: { label: "Low",       color: "#6495ED", emoji: "🔵" },
  3: { label: "Moderate",  color: "#90EE90", emoji: "🟢" },
  4: { label: "High",      color: "#FFA500", emoji: "🟠" },
  5: { label: "Very High", color: "#DC143C", emoji: "🔴" },
};

export default function PixelPredictor({ apiBase = "https://suryadrishti-api.onrender.com" }) {
  const [ndvi, setNdvi]     = useState(0.15);
  const [temp, setTemp]     = useState(43.0);
  const [lulc, setLulc]     = useState(6);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const predict = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/predict/pixel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ndvi:        parseFloat(ndvi),
          temperature: parseFloat(temp),
          lulc:        parseInt(lulc),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const riskMeta = result ? RISK_META[result.prediction] : null;

  return (
    <div className="pixel-predictor">
      <div className="input-group">
        <label className="input-label">
          NDVI Value <span className="input-range muted">0.0 → 0.5</span>
        </label>
        <input type="range" min="0" max="0.5" step="0.01"
          value={ndvi} onChange={e => setNdvi(e.target.value)} className="slider" />
        <span className="slider-val mono">{parseFloat(ndvi).toFixed(2)}</span>
      </div>

      <div className="input-group">
        <label className="input-label">
          Temperature (°C) <span className="input-range muted">30 → 55</span>
        </label>
        <input type="range" min="30" max="55" step="0.5"
          value={temp} onChange={e => setTemp(e.target.value)} className="slider" />
        <span className="slider-val mono">{parseFloat(temp).toFixed(1)}°C</span>
      </div>

      <div className="input-group">
        <label className="input-label">Land Cover Class</label>
        <select value={lulc} onChange={e => setLulc(e.target.value)} className="select">
          {LULC_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      <button className="predict-btn" onClick={predict} disabled={loading}>
        {loading ? "Predicting…" : "⚡ Predict Heat Risk"}
      </button>

      {error && (
        <div className="pred-error">⚠ {error}</div>
      )}

      {result && riskMeta && (
        <div className="pred-result" style={{ borderColor: riskMeta.color }}>
          <div className="result-top">
            <span className="result-emoji">{riskMeta.emoji}</span>
            <div>
              <div className="result-label" style={{ color: riskMeta.color }}>
                {riskMeta.label}
              </div>
              <div className="result-zone muted">Heat Risk Zone {result.prediction}/5</div>
            </div>
          </div>
          {result.probability && (
            <div className="prob-bars">
              {result.probability.map((p, i) => (
                <div key={i} className="prob-row">
                  <span className="prob-cls muted">{i+1}</span>
                  <div className="prob-track">
                    <div className="prob-fill"
                      style={{ width: `${p*100}%`, background: RISK_META[i+1]?.color }} />
                  </div>
                  <span className="prob-val mono">{(p*100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
