import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";

function AIPoster() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
    setToken(storedToken);
  }, [navigate]);

  return (
    <div className="ai-poster">
      <h1>AI Poster Generator</h1>
      <p>This feature is currently under development. Please check back later.</p>
    </div>
  );
}

export default AIPoster;
