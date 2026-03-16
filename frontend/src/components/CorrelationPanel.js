import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import "./CorrelationPanel.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function CorrelationPanel({ analysis }) {
  const corr   = analysis?.correlation;
  const lulc   = analysis?.lulc_heat || [];
  const deficit = analysis?.green_deficit;

  if (!corr && !lulc.length) {
    return (
      <div className="corr-empty">
        <p className="muted">Run analysis.py to see correlation data</p>
        <code className="cmd-hint">python backend/ml/analysis.py</code>
      </div>
    );
  }

  // NDVI bin chart
  const binData = corr?.ndvi_bins
    ? {
        labels: corr.ndvi_bins.map(v => v.toFixed(2)),
        datasets: [{
          label: "Avg Temperature (°C)",
          data:  corr.avg_temp_per_bin,
          backgroundColor: corr.avg_temp_per_bin?.map(t =>
            t > 44 ? "#DC143C" :
            t > 42 ? "#FFA500" :
            t > 39 ? "#90EE90" :
                     "#6495ED"
          ),
          borderRadius: 4,
          borderSkipped: false,
        }],
      }
    : null;

  const binOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#141c2a",
        borderColor:     "#1e2d42",
        borderWidth:     1,
        titleColor:      "#e2e8f0",
        bodyColor:       "#94a3b8",
        callbacks: {
          label: ctx => ` ${ctx.parsed.y.toFixed(1)}°C`,
          title: ctx => `NDVI ≈ ${ctx[0].label}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { size: 10 } },
        grid:  { color: "rgba(255,255,255,0.04)" },
        title: { display: true, text: "NDVI Value →", color: "#64748b", font: { size: 11 } },
      },
      y: {
        ticks: { color: "#64748b", font: { size: 10 }, callback: v => `${v}°C` },
        grid:  { color: "rgba(255,255,255,0.04)" },
        title: { display: true, text: "Avg Temperature", color: "#64748b", font: { size: 11 } },
      },
    },
  };

  return (
    <div className="corr-panel">

      {/* Pearson r badge */}
      {corr && (
        <div className="corr-badges">
          <div className="corr-badge">
            <span className="badge-label mono">PEARSON r</span>
            <span
              className="badge-value mono"
              style={{ color: corr.pearson_r < -0.3 ? "var(--accent)" : "var(--warning)" }}
            >
              {corr.pearson_r}
            </span>
          </div>
          <div className="corr-badge">
            <span className="badge-label mono">SIGNIFICANCE</span>
            <span className="badge-value" style={{ color: corr.significant ? "var(--accent)" : "var(--warning)" }}>
              {corr.significant ? "p < 0.05 ✓" : "p ≥ 0.05"}
            </span>
          </div>
          <div className="corr-badge corr-badge--wide">
            <span className="badge-label mono">INTERPRETATION</span>
            <span className="badge-value" style={{ fontSize: 12, color: "var(--text)" }}>
              {corr.interpretation}
            </span>
          </div>
        </div>
      )}

      {/* NDVI bin chart */}
      {binData && (
        <div className="corr-chart">
          <p className="chart-title">Average Temperature per NDVI Range</p>
          <Bar data={binData} options={binOptions} />
        </div>
      )}

      {/* LULC heat table */}
      {lulc.length > 0 && (
        <div className="lulc-table">
          <p className="chart-title">Temperature by Land Cover Class</p>
          <table>
            <thead>
              <tr>
                <th>Land Cover</th>
                <th>Avg Temp</th>
                <th>Max Temp</th>
                <th>Pixels</th>
              </tr>
            </thead>
            <tbody>
              {lulc.map(row => (
                <tr key={row.class_id}>
                  <td>{row.class_name}</td>
                  <td style={{
                    color: row.avg_temp > 43 ? "var(--danger)" :
                           row.avg_temp > 40 ? "var(--warning)" : "var(--accent)"
                  }}>
                    {row.avg_temp}°C
                  </td>
                  <td className="muted">{row.max_temp}°C</td>
                  <td className="muted mono">{row.pixel_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Green deficit callout */}
      {deficit && (
        <div className="deficit-callout">
          <span className="deficit-icon">🌿</span>
          <div>
            <strong style={{ color: "var(--warning)" }}>
              {deficit.deficit_percentage}% of Delhi
            </strong>{" "}
            <span className="muted">is classified as Green Space Deficit</span>
            <p className="muted" style={{ marginTop: 4, fontSize: 11 }}>
              {deficit.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
