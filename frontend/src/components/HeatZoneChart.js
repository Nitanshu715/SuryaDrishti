import React from "react";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "./HeatZoneChart.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const ZONE_COLORS = [
  "#00008B",
  "#6495ED",
  "#90EE90",
  "#FFA500",
  "#DC143C",
];

export default function HeatZoneChart({ zones, loading }) {
  if (loading) {
    return <div className="chart-loading mono">Loading data…</div>;
  }

  if (!zones || zones.length === 0) {
    return (
      <div className="chart-empty">
        <p className="muted">Run predict.py to see zone distribution</p>
        <code className="cmd-hint">python backend/ml/predict.py</code>
      </div>
    );
  }

  const data = {
    labels: zones.map(z => z.label),
    datasets: [{
      data:            zones.map(z => z.percentage),
      backgroundColor: ZONE_COLORS,
      borderColor:     "rgba(0,0,0,0.3)",
      borderWidth:     2,
      hoverOffset:     6,
    }],
  };

  const options = {
    responsive: true,
    cutout: "68%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ctx => ` ${ctx.parsed.toFixed(1)}% of Delhi`,
        },
        backgroundColor: "#141c2a",
        borderColor:     "#1e2d42",
        borderWidth:     1,
        titleColor:      "#e2e8f0",
        bodyColor:       "#94a3b8",
        padding:         10,
      },
    },
  };

  return (
    <div className="heat-zone-chart">
      <div className="donut-wrap">
        <Doughnut data={data} options={options} />
        <div className="donut-center">
          <span className="donut-label mono">ZONES</span>
        </div>
      </div>

      <div className="zone-legend">
        {zones.map((z, i) => (
          <div key={z.class} className="zone-row">
            <span className="zone-swatch" style={{ background: ZONE_COLORS[i] }} />
            <span className="zone-name">{z.label}</span>
            <span className="zone-pct mono">{z.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
