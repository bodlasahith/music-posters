import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Components.css";
import { all } from "axios";

function Home() {
  const [token, setToken] = useState(null);
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchArtists = async () => {
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
    };

    const fetchTracks = async () => {
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
    };

    if (token) {
      fetchArtists();
      fetchTracks();
    }
  }, [token]);

  useEffect(() => {
    if (artists && tracks) {
      const carousels = document.querySelectorAll(".carousel-container");

      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        addAnimation();
      }

      function addAnimation() {
        carousels.forEach((scroller) => {
          scroller.setAttribute("data-animated", true);

          const scrollerInner = scroller.querySelectorAll(".image-carousel");
          const scrollerContent = Array.from(scrollerInner).flatMap((carousel) =>
            Array.from(carousel.children)
          );

          scrollerContent.forEach((item) => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute("aria-hidden", true);
            scrollerInner.appendChild(duplicatedItem);
          });
        });
      }
    }
  }, []);

  return (
    <div className="Home">
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
      <h1>Music Posters</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Home;
