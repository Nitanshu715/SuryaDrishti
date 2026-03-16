import React from "react";
import "./RecommendationsPanel.css";

const PRIORITY_COLORS = {
  Critical: "var(--danger)",
  High:     "var(--warning)",
  Medium:   "var(--accent2)",
  Preserve: "var(--accent)",
};

const STATIC_RECS = [
  {
    id: 1,
    zone: "West Delhi — Dwarka/Najafgarh Area",
    heat_class: "Very High (>45°C)",
    recommendation: "Urban forest belt along Najafgarh Road",
    estimated_cooling: "3–5°C surface temp reduction",
    priority: "Critical",
  },
  {
    id: 2,
    zone: "South West — Industrial Corridors",
    heat_class: "High (42–45°C)",
    recommendation: "Tree corridors along NH-48 and Ring Road",
    estimated_cooling: "2–4°C",
    priority: "High",
  },
  {
    id: 3,
    zone: "Central Delhi — Dense Urban Core",
    heat_class: "Moderate–High",
    recommendation: "Rooftop gardens + pocket parks in wards",
    estimated_cooling: "1–2°C",
    priority: "High",
  },
  {
    id: 4,
    zone: "North Delhi — Industrial Zones",
    heat_class: "High (42–45°C)",
    recommendation: "Green buffer zones around industrial clusters",
    estimated_cooling: "2–3°C",
    priority: "Medium",
  },
  {
    id: 5,
    zone: "Yamuna Floodplain",
    heat_class: "Low",
    recommendation: "Preserve and expand riparian vegetation along banks",
    estimated_cooling: "Maintains current cooling effect",
    priority: "Preserve",
  },
];

export default function RecommendationsPanel({ analysis }) {
  const recs = analysis?.recommendations || STATIC_RECS;

  return (
    <div className="recs-panel">
      {recs.map(rec => (
        <div key={rec.id} className="rec-card">
          <div
            className="rec-priority"
            style={{ background: PRIORITY_COLORS[rec.priority] }}
          >
            {rec.priority}
          </div>

          <div className="rec-body">
            <div className="rec-zone">{rec.zone}</div>
            <div className="rec-heat muted">{rec.heat_class}</div>
            <div className="rec-action">💡 {rec.recommendation}</div>
            <div className="rec-cooling">
              <span className="cooling-icon">🌡️</span>
              <span className="muted">Estimated cooling:</span>{" "}
              <span className="cooling-val" style={{ color: "var(--accent)" }}>
                {rec.estimated_cooling}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
