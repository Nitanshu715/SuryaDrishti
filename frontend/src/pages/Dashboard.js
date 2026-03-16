import React, { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import MapViewer from "../components/MapViewer";
import HeatZoneChart from "../components/HeatZoneChart";
import CorrelationPanel from "../components/CorrelationPanel";
import RecommendationsPanel from "../components/RecommendationsPanel";
import ModelMetrics from "../components/ModelMetrics";
import PixelPredictor from "../components/PixelPredictor";
import "./Dashboard.css";

// Direct API URL — bypasses proxy issues
const API = "https://suryadrishti-api.onrender.com";

export default function Dashboard({ apiStatus }) {
  const [summary, setSummary]   = useState(null);
  const [hotspots, setHotspots] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [activeMap, setActiveMap] = useState("uhi");
  const [loading, setLoading]   = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Check health first
        const health = await fetch(`${API}/api/health`).then(r => r.json());
        setApiOnline(health.status === "ok");

        const [sumRes, hotRes, anaRes] = await Promise.all([
          fetch(`${API}/api/summary`).then(r => r.json()).catch(() => null),
          fetch(`${API}/api/hotspots`).then(r => r.json()).catch(() => null),
          fetch(`${API}/api/analysis`).then(r => r.json()).catch(() => null),
        ]);
        setSummary(sumRes);
        setHotspots(hotRes);
        setAnalysis(anaRes);
      } catch (e) {
        console.error("API connection failed:", e);
        setApiOnline(false);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const stats = summary?.stats || {};
  const zones = hotspots?.zones || [];
  const veryHighPct = zones.find(z => z.class === 5)?.percentage || 0;
  const highPct     = zones.find(z => z.class === 4)?.percentage || 0;
  const lowPct      = (zones.find(z => z.class === 1)?.percentage || 0) +
                      (zones.find(z => z.class === 2)?.percentage || 0);
  const corr = analysis?.correlation?.pearson_r ?? stats?.ndvi_temp_correlation;
  const deficit = analysis?.green_deficit?.deficit_percentage;

  return (
    <div className="dashboard">

      <header className="dash-header">
        <div className="header-left">
          <div className="logo-mark">
            <span className="logo-icon">🌍</span>
            <div>
              <h1 className="project-title">SuryaDrishti</h1>
              <p className="project-sub mono">
                Delhi Urban Heat Island Intelligence · Landsat 9
              </p>
            </div>
          </div>
        </div>
        <div className="header-right">
          <div className="api-badge">
            <span className={`status-dot ${apiOnline ? "online" : "offline"}`} />
            <span className="mono" style={{ fontSize: 11 }}>
              {apiOnline ? "API ONLINE" : "API OFFLINE"}
            </span>
          </div>
          <div className="data-badge mono">LANDSAT 9 · DELHI · 2025</div>
        </div>
      </header>

      <section className="stat-row fade-in">
        <StatCard
          label="Very High Risk Zone"
          value={`${veryHighPct.toFixed(1)}%`}
          sub=">45°C Surface Temp"
          color="danger"
          icon="🔴"
        />
        <StatCard
          label="High Risk Zone"
          value={`${highPct.toFixed(1)}%`}
          sub="42–45°C"
          color="warning"
          icon="🟠"
        />
        <StatCard
          label="Cool / Low Risk"
          value={`${lowPct.toFixed(1)}%`}
          sub="Below 39°C"
          color="accent"
          icon="🟢"
        />
        <StatCard
          label="NDVI–Temp Correlation"
          value={corr != null ? corr.toFixed(3) : "—"}
          sub="Pearson r"
          color={corr != null && corr < -0.05 ? "accent" : "warning"}
          icon="📊"
        />
        <StatCard
          label="Green Deficit Area"
          value={deficit != null ? `${deficit}%` : "—"}
          sub="Low NDVI + High Temp"
          color="danger"
          icon="🌿"
        />
      </section>

      <section className="main-row fade-in">
        <div className="map-panel">
          <div className="panel-header">
            <h2 className="panel-title">Satellite Map Layers</h2>
            <div className="map-tabs">
              {[
                { id: "uhi",        label: "UHI Zones" },
                { id: "ndvi",       label: "NDVI" },
                { id: "prediction", label: "AI Prediction" },
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`map-tab ${activeMap === tab.id ? "active" : ""}`}
                  onClick={() => setActiveMap(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <MapViewer layer={activeMap} apiBase={API} />
          <p className="map-caption muted">
            Data Source: Landsat 9 OLI/TIRS · Prepared by: Chandreyee Dey Roy
          </p>
        </div>

        <div className="side-panels">
          <div className="panel">
            <h2 className="panel-title">Heat Zone Distribution</h2>
            <HeatZoneChart zones={zones} loading={loading} />
          </div>
          <div className="panel">
            <h2 className="panel-title">ML Model Performance</h2>
            <ModelMetrics summary={summary} />
          </div>
        </div>
      </section>

      <section className="analysis-row fade-in">
        <div className="panel wide-panel">
          <h2 className="panel-title">NDVI vs Temperature Correlation</h2>
          <CorrelationPanel analysis={analysis} />
        </div>
        <div className="panel">
          <h2 className="panel-title">Live Pixel Predictor</h2>
          <p className="muted" style={{ marginBottom: 12 }}>
            Enter satellite values to predict heat risk class
          </p>
          <PixelPredictor apiBase={API} />
        </div>
      </section>

      <section className="recs-section fade-in">
        <div className="panel full-panel">
          <h2 className="panel-title">🌿 Green Corridor Recommendations</h2>
          <p className="muted" style={{ marginBottom: 16 }}>
            Evidence-based urban greening strategies derived from heat + NDVI analysis
          </p>
          <RecommendationsPanel analysis={analysis} />
        </div>
      </section>

      <footer className="dash-footer mono">
        Delhi UHI Intelligence Platform · Built with Landsat 9 + scikit-learn + React ·
        ISRO/NRSC Internship Portfolio · Accuracy: 95.99% · F1: 0.962
      </footer>
    </div>
  );
}
