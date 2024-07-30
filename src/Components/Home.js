import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import { BorderAll, FileMusic, Stars } from "react-bootstrap-icons";
import Player from "./Player";

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

        if (response.status === 401) {
          window.localStorage.removeItem("token");
          navigate("/");
        }

        const data = await response.json();
        setArtists(data.items);
      } catch (error) {
        console.error("Error fetching artists:", error);
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

        if (response.status === 401) {
          window.localStorage.removeItem("token");
          navigate("/");
        }

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
      <div className="home-content">
        <div className="home-title">
          <h1>Music Posters</h1>
          <h3>Generate personal posters of your top artists, albums, and tracks!</h3>
          <div className="description">
            <div className="description-item">
              <FileMusic className="description-icon" />
              <p>Create tracklists of your favorite albums</p>
            </div>
            <div className="description-item">
              <BorderAll className="description-icon" />
              <p>Generate compilations of your top artists or albums</p>
            </div>
            <div className="description-item">
              <Stars className="description-icon" />
              <p>Design AI generated posters based on your music preferences</p>
            </div>
          </div>
        </div>
        <Player />
      </div>
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
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
                style={{
                  borderRadius: "50%",
                  padding: "5px",
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={() => window.open(artist.external_urls.spotify)}
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
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.1)";
                  e.target.style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
                style={{
                  borderRadius: "50%",
                  padding: "5px",
                  transition: "transform 0.2s ease-in-out",
                }}
                onClick={() => window.open(track.album.external_urls.spotify)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
