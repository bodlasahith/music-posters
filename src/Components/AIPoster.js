import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";

function AIPoster() {
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
  }, [navigate]);

  function fetchGeneratedImage() {
    try {
      const response = fetch("/generate-image")
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("generatedImage").src = data.imageUrl;
        });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("There has been a problem with your fetch operation:", error);
    }
  }

  return (
    <div className="ai-poster">
      <h1>AI Poster Generator</h1>
      <p>Click the button below to generate an AI-generated poster.</p>
      <button onClick={fetchGeneratedImage}>Generate Poster</button>
      <img id="generatedImage" alt="Generated Content" />
    </div>
  );
}

export default AIPoster;
