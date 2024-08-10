import React, { useEffect, useState } from "react";
import "./Components.css";
import ColorThief from "colorthief";

function Player() {
  const [token, setToken] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [trackCover, setTrackCover] = useState(null);

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

      if (data.item) {
        setCurrentTrack(data.item.external_urls.spotify);
        if (data.item.album) {
          setTrackCover(data.item.album.images[0].url);
        } else {
          setTrackCover(data.item.images[0].url);
        }
      } else {
        console.error("No track currently playing");
      }
    } catch (error) {
      console.error("Error fetching current track:", error);
    }
  };

  const setBackgroundColor = () => {
    const img = document.querySelector("img");
    const colorThief = new ColorThief();
    const color = colorThief.getColor(img);
    if (color) {
      const [r, g, b] = color;
      document.querySelector(".home").style.background = `rgba(${r}, ${g}, ${b}, 0.35)`;
    }
  }

  return (
    <div className="player">
      <h2>Now playing...</h2>
      {trackCover && (
        <img 
          src={trackCover}
          onLoad={setBackgroundColor}
          alt="track cover"
          crossOrigin="anonymous"
          style={{display: "none"}}
        />
      )}
      {currentTrack ? (
        <iframe
          src={`https://open.spotify.com/embed/track/${currentTrack.split("/").pop()}`}
          frameBorder="0"
          allowtransparency="true"
          allow="encrypted-media"
          title="player"
        />
      ) : (
        <p>No track currently playing</p>
      )}
    </div>
  );
}

export default Player;
