import React, { useEffect, useState } from "react";
import "./Components.css";

function Player() {
  const [token, setToken] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      window.location.href = "/";
    }
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentTrack(token);
    }
  }, [token]);

  const fetchCurrentTrack = async (token) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data) {
        if (data.type === "track") {
          setCurrentTrack(data.item.album.external_urls.spotify);
        } else {
          setCurrentTrack(data.item.external_urls.spotify);
        }
      } else {
        console.error("No track currently playing");
      }
    } catch (error) {
      console.error("Error fetching current track:", error);
    }
  };

  return (
    <div className="player">
      <h2>Now playing...</h2>
      {currentTrack && (
        <iframe
          src={`https://open.spotify.com/embed/track/${currentTrack.split("/").pop()}`}
          frameBorder="0"
          allowtransparency="true"
          allow="encrypted-media"
          title="player"
        />
      )}
    </div>
  );
}

export default Player;
