import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import axios from "axios";

function AIPoster() {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
  }, [navigate]);

  const handleGenerateImage = async () => {
    if (!prompt) return;
    try {
      const response = await axios.get(
        `http://localhost:3001/generate-image?prompt=${encodeURIComponent(prompt)}`,
        { responseType: "blob" }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setImageSrc(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <div className="ai-poster">
      <h1>AI Poster Generator</h1>
      <h2>Click the button below to generate an AI-generated poster. (Windows only)</h2>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter prompt"
      />
      <button onClick={handleGenerateImage}>Generate Poster</button>
      {imageSrc && <img src={imageSrc} alt="Generated" />}
    </div>
  );
}

export default AIPoster;
