import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Share } from "react-bootstrap-icons";
import { analyzeListeningProfile } from "../utils/tasteProfileAnalyzer";
import TasteProfilePoster from "./TasteProfilePoster";
import "./Components.css";

function TasteProfile() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState(null);
  const [topArtists, setTopArtists] = useState(null);
  const [topTracks, setTopTracks] = useState(null);
  const [error, setError] = useState(null);
  const [showPoster, setShowPoster] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
      return;
    }
    setToken(storedToken);
  }, [navigate]);

  const analyzeProfile = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      // Analyze using listening history instead of playlists
      const analysisResult = await analyzeListeningProfile(token);
      setProfile(analysisResult.profile);
      setScores(analysisResult.scores);
      setTopArtists(analysisResult.topArtists);
      setTopTracks(analysisResult.topTracks);
      setShowPoster(true);
    } catch (err) {
      console.error("Error analyzing profile:", err);
      setError(
        err.message ||
          "Failed to analyze your taste profile. Make sure you have some listening history on Spotify!",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    const element = document.getElementById("taste-profile-poster");
    if (!element) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `spotify-taste-profile-${new Date().getTime()}.png`;
      link.click();
    } catch (err) {
      console.error("Error downloading image:", err);
      alert("Failed to download image");
    }
  };

  const shareToSocial = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Spotify Taste Profile",
          text: `I'm a ${profile.name}! Check out my unique Spotify taste profile.`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("Share functionality not available on this device");
    }
  };

  return (
    <div className="taste-profile-container">
      <div className="taste-profile-header">
        <h1>🎵 Spotify Taste Profile</h1>
        <p>Discover your unique music personality based on your playlists</p>
      </div>

      {!showPoster ? (
        <div className="taste-profile-generator">
          <div className="generator-content">
            <h2>Ready to discover your music personality?</h2>
            <p>
              We'll analyze your playlists and create a unique profile that describes your musical
              taste. Think of it like a Myers-Briggs test, but for your Spotify.
            </p>

            {error && <div className="error-message">{error}</div>}

            <button onClick={analyzeProfile} disabled={loading} className="generate-btn">
              {loading ? "Analyzing Your Taste..." : "Analyze My Taste Profile"}
            </button>
          </div>
        </div>
      ) : (
        <div className="taste-profile-results">
          <TasteProfilePoster
            profile={profile}
            scores={scores}
            topArtists={topArtists}
            topTracks={topTracks}
          />

          <div className="profile-actions">
            <button onClick={downloadImage} className="action-btn">
              <Download size={20} /> Download Image
            </button>
            <button onClick={shareToSocial} className="action-btn">
              <Share size={20} /> Share
            </button>
            <button
              onClick={() => {
                setShowPoster(false);
                setProfile(null);
                setScores(null);
                setTopArtists(null);
                setTopTracks(null);
              }}
              className="action-btn secondary"
            >
              Analyze Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasteProfile;
