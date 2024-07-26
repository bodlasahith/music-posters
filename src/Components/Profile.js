import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [topArtists, setTopArtists] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [topGenres, setTopGenres] = useState([]);

  useEffect(() => {
    const token = window.localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    setToken(token);

    const userId = window.localStorage.getItem("userId");
    const email = window.localStorage.getItem("email");
    const username = window.localStorage.getItem("username");
    const account = window.localStorage.getItem("account");
    const image = window.localStorage.getItem("image");

    const info = {
      userId: userId,
      email: email,
      username: username,
      account: account,
      image: image,
    };

    getUserInfo(info);
  }, [navigate]);

  const getUserInfo = async (info) => {
    try {
      const queryString = new URLSearchParams(info).toString();

      const userInfo = await axios.get(`http://localhost:3001/api/get-user?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      setUserInfo(userInfo.data);
      setShowInfo(true);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const deletePoster = async (index) => {
    const userId = window.localStorage.getItem("userId");
    const poster = userInfo.posters[index];

    try {
      await axios.post(
        "http://localhost:3001/api/delete-poster",
        { userId: userId, poster: poster },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const updatedPosters = userInfo.posters.filter((_, i) => i !== index);
      setUserInfo({ ...userInfo, posters: updatedPosters });
    } catch (error) {
      console.error("Error deleting poster:", error);
    }
  };

  const getTopArtists = async () => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10`,
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
      setTopArtists(data.items);

      const genres = data.items.map((artist) => artist.genres).flat();
      const uniqueGenres = [...new Set(genres)];
      setTopGenres(uniqueGenres.splice(0, 10));
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const getTopTracks = async () => {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10`,
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
      setTopTracks(allTracks);
    } catch (error) {
      console.error("Error fetching tracks:", error);
    }
  };

  useEffect(() => {
    if (token) {
      getTopArtists();
      getTopTracks();
    }
  }, [token]);

  const logout = () => {
    window.localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="profile">
      <div className="profile-container">
        <h1 className="profile-title">Profile</h1>
        {showInfo && (
          <div className="profile-info">
            <div className="profile-text">
              <p className="profile-username">Username: {userInfo.username}</p>
              <p className="profile-email">Email: {userInfo.email}</p>
              <p className="profile-account">
                Spotify Account: <a href={userInfo.account}>{userInfo.account}</a>
              </p>
            </div>
            <img className="profile-image" src={userInfo.image} alt="User" />
          </div>
        )}
        <button className="profile-logout-button" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="top-content">
        <div className="profile-top-artists">
          <h2>Top Artists</h2>
          <p>
            {topArtists.map((artist) => (
              <li key={artist.id}>{artist.name}</li>
            ))}
          </p>
        </div>
        <div className="profile-top-tracks">
          <h2>Top Tracks</h2>
          <p>
            {topTracks.map((track) => (
              <li key={track.id}>{track.name}</li>
            ))}
          </p>
        </div>
        <div className="profile-top-genres">
          <h2>Top Genres</h2>
          <p>
            {topGenres.map((genre) => (
              <li key={genre}>{genre}</li>
            ))}
          </p>
        </div>
      </div>
      <div className="posters">
        <h2>Saved Compilation Posters</h2>
        <h5>Right-click to delete (PERMANENT)</h5>
        {showInfo && userInfo.posters && userInfo.posters.length > 0 && (
          <div className="poster-container">
            {userInfo.posters.map((poster, index) => (
              <div key={index} style={{ display: "flex" }}>
                <img
                  src={poster}
                  style={{ width: "25%" }}
                  alt={`Poster ${index + 1}`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    deletePoster(index);
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
