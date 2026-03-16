import React, { useState, useEffect } from "react";
import Dashboard from "./pages/Dashboard";
import "./App.css";

const API = "https://suryadrishti-api.onrender.com";

function App() {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/health`)
      .then(r => r.json())
      .then(setApiStatus)
      .catch(() => setApiStatus({ status: "offline" }));
  }, []);

  return (
    <div className="app">
      <Dashboard apiStatus={apiStatus} />
    </div>
  );
}

export default App;
