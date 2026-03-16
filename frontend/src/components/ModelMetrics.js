import React from "react";
import "./ModelMetrics.css";

function MetricBar({ label, value, max = 1, color = "var(--accent)" }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="metric-row">
      <span className="metric-label">{label}</span>
      <div className="metric-bar-wrap">
        <div className="metric-bar-track">
          <div
            className="metric-bar-fill"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span className="metric-val mono">{(value * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
}

export default function ModelMetrics({ summary }) {
  const metrics = summary?.model_metrics;

  if (!metrics || metrics.accuracy == null) {
    return (
      <div className="metrics-empty">
        <p className="muted" style={{ fontSize: 12 }}>
          Train the model to see performance metrics
        </p>
        <code className="cmd-hint">python backend/ml/train.py</code>
      </div>
    );
  }

  return (
    <div className="model-metrics">
      <div className="model-badge">
        <span className="model-name mono">RandomForestClassifier</span>
        <span className="model-tag">n=150 trees</span>
      </div>

      <MetricBar
        label="Accuracy"
        value={metrics.accuracy}
        color="var(--accent)"
      />
      <MetricBar
        label="F1 Macro"
        value={metrics.f1_macro}
        color="var(--accent2)"
      />

      <div className="metric-divider" />

      <div className="features-list">
        <p className="features-title muted">Input Features</p>
        {["NDVI Value", "Surface Temperature", "LULC Class"].map(f => (
          <div key={f} className="feature-tag">{f}</div>
        ))}
      </div>

      <div className="target-note muted">
        Target: UHI Heat Zone (5 classes)
      </div>
    </div>
  );
}
