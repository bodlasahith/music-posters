import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";

function Home() {
  const [token, setToken] = useState(null);
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      navigate("/");
    }
    setToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=50`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        setArtists(data.items);
      } catch (error) {
        console.error("Error fetching artists:", error);
        window.localStorage.removeItem("token");
        navigate("/");
      }
    };

    const fetchTracks = async () => {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        const allTracks = data.items;
  
        if (allTracks) {
          const albumIds = new Set();
          const uniqueTracks = allTracks.filter((track) => {
            const isUnique = !albumIds.has(track.album.id);
            if (isUnique) {
              albumIds.add(track.album.id);
            }
            return isUnique;
          });
  
          setTracks(uniqueTracks);
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }
    };

    if (token) {
      fetchArtists();
      fetchTracks();
    }
  }, [token, navigate]);

  useEffect(() => {
    if (artists && tracks) {
      const carousels = document.querySelectorAll(".carousel-container");

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
      }

      function addAnimation() {
        carousels.forEach((scroller) => {
          scroller.setAttribute("data-animated", true);
        });
      }
    }
  }, [artists, tracks]);

  return (
    <div className="home">
      <h1>Music Posters</h1>
      {artists && (
        <div className="carousel-container" data-direction="left" data-speed="slow">
          <div className="image-carousel" id="top-carousel">
            {artists.map((artist) => (
              <img
                key={artist.id}
                src={artist.images[0].url}
                alt={artist.name}
                height={100}
                width={100}
              />
            ))}
          </div>
        </div>
      )}
      {tracks && (
        <div className="carousel-container" data-direction="left" data-speed="slow">
          <div className="image-carousel" id="bottom-carousel">
            {tracks.map((track) => (
              <img
                key={track.id}
                src={track.album.images[0].url}
                alt={track.name}
                height={100}
                width={100}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
