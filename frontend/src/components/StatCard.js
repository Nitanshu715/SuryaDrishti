import React from "react";
import "./StatCard.css";

export default function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className={`stat-value mono stat-value--${color}`}>{value}</span>
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub muted">{sub}</div>
    </div>
  );
}
