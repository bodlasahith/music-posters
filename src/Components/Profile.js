import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [topArtistsShort, setTopArtistsShort] = useState([]);
  const [topTracksShort, setTopTracksShort] = useState([]);
  const [topGenresShort, setTopGenresShort] = useState([]);
  const [topArtistsMedium, setTopArtistsMedium] = useState([]);
  const [topTracksMedium, setTopTracksMedium] = useState([]);
  const [topGenresMedium, setTopGenresMedium] = useState([]);
  const [topArtistsLong, setTopArtistsLong] = useState([]);
  const [topTracksLong, setTopTracksLong] = useState([]);
  const [topGenresLong, setTopGenresLong] = useState([]);
  const [showArtistsShort, setShowArtistsShort] = useState(false);
  const [showTracksShort, setShowTracksShort] = useState(false);
  const [showGenresShort, setShowGenresShort] = useState(false);
  const [showArtistsMedium, setShowArtistsMedium] = useState(false);
  const [showTracksMedium, setShowTracksMedium] = useState(false);
  const [showGenresMedium, setShowGenresMedium] = useState(false);
  const [showArtistsLong, setShowArtistsLong] = useState(true);
  const [showTracksLong, setShowTracksLong] = useState(true);
  const [showGenresLong, setShowGenresLong] = useState(true);

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
      const responseShort = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (responseShort.status === 401) {
        window.localStorage.removeItem("token");
        navigate("/");
      }

      const dataShort = await responseShort.json();
      setTopArtistsShort(dataShort.items);

      const genresShort = dataShort.items.map((artist) => artist.genres).flat();
      const uniqueGenresShort = [...new Set(genresShort)];
      setTopGenresShort(uniqueGenresShort.splice(0, 10));

      const responseMedium = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataMedium = await responseMedium.json();
      setTopArtistsMedium(dataMedium.items);

      const genresMedium = dataMedium.items.map((artist) => artist.genres).flat();
      const uniqueGenresMedium = [...new Set(genresMedium)];
      setTopGenresMedium(uniqueGenresMedium.splice(0, 10));
      
      const responseLong = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataLong = await responseLong.json();
      setTopArtistsLong(dataLong.items);

      const genresLong = dataLong.items.map((artist) => artist.genres).flat();
      const uniqueGenresLong = [...new Set(genresLong)];
      setTopGenresLong(uniqueGenresLong.splice(0, 10));
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const getTopTracks = async () => {
    try {
      const responseShort = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (responseShort.status === 401) {
        window.localStorage.removeItem("token");
        navigate("/");
      }

      const dataShort = await responseShort.json();
      const allTracksShort = dataShort.items;
      setTopTracksShort(allTracksShort);

      const responseMedium = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataMedium = await responseMedium.json();
      const allTracksMedium = dataMedium.items;
      setTopTracksMedium(allTracksMedium);

      const responseLong = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const dataLong = await responseLong.json();
      const allTracksLong = dataLong.items;
      setTopTracksLong(allTracksLong);
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

  const artistSwitch = (e) => {
    const id = e.target.id;
    if (id === "short-term") {
      setShowArtistsShort(true);
      setShowArtistsMedium(false);
      setShowArtistsLong(false);
    } else if (id === "medium-term") {
      setShowArtistsShort(false);
      setShowArtistsMedium(true);
      setShowArtistsLong(false);
    } else {
      setShowArtistsShort(false);
      setShowArtistsMedium(false);
      setShowArtistsLong(true);
    }
  };

  const trackSwitch = (e) => {
    const id = e.target.id;
    if (id === "short-term") {
      setShowTracksShort(true);
      setShowTracksMedium(false);
      setShowTracksLong(false);
    } else if (id === "medium-term") {
      setShowTracksShort(false);
      setShowTracksMedium(true);
      setShowTracksLong(false);
    } else {
      setShowTracksShort(false);
      setShowTracksMedium(false);
      setShowTracksLong(true);
    }
  }

  const genreSwitch = (e) => {
    const id = e.target.id;
    if (id === "short-term") {
      setShowGenresShort(true);
      setShowGenresMedium(false);
      setShowGenresLong(false);
    } else if (id === "medium-term") {
      setShowGenresShort(false);
      setShowGenresMedium(true);
      setShowGenresLong(false);
    } else {
      setShowGenresShort(false);
      setShowGenresMedium(false);
      setShowGenresLong(true);
    }
  }

  return (
    <div className="profile">
      <div className="profile-container">
        <h1 className="profile-title">Profile</h1>
        {showInfo ? (
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
        ) : (
          <p>Loading...</p>
        )}
        <button className="profile-logout-button" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="top-content">
        <div className="profile-top-artists">
          <h2>Top Artists</h2>
          {showArtistsShort && (
            <div>
              <h4>Short-term (4 weeks)</h4>
              <p>
                {topArtistsShort.map((artist) => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </p>
            </div>
          )}
          {showArtistsMedium && (
            <div>
              <h4>Medium-term (6 months)</h4>
              <p>
                {topArtistsMedium.map((artist) => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </p>
            </div>
          )}
          {showArtistsLong && (
            <div>
              <h4>Long-term (12 months)</h4>
              <p>
                {topArtistsLong.map((artist) => (
                  <li key={artist.id}>{artist.name}</li>
                ))}
              </p>
            </div>
          )}
          <div className="top-buttons">
            <button id="short-term" onClick={(e) => artistSwitch(e)}>Short-term (4 weeks)</button>
            <button id="medium-term" onClick={(e) => artistSwitch(e)}>Medium-term (6 months)</button>
            <button id="long-term" onClick={(e) => artistSwitch(e)}>Long-term (12 months)</button>
          </div>
        </div>
        <div className="profile-top-tracks">
          <h2>Top Tracks</h2>
          {showTracksShort && (
            <div>
              <h4>Short-term (4 weeks)</h4>
              <p>
                {topTracksShort.map((track) => (
                  <li key={track.id}>{track.name}</li>
                ))}
              </p>
            </div>
          )}
          {showTracksMedium && (
            <div>
              <h4>Medium-term (6 months)</h4>
              <p>
                {topTracksMedium.map((track) => (
                  <li key={track.id}>{track.name}</li>
                ))}
              </p>
            </div>
          )}
          {showTracksLong && (
            <div>
              <h4>Long-term (12 months)</h4>
              <p>
                {topTracksLong.map((track) => (
                  <li key={track.id}>{track.name}</li>
                ))}
              </p>
            </div>
          )}
          <div className="top-buttons">
            <button id="short-term" onClick={(e) => trackSwitch(e)}>Short-term (4 weeks)</button>
            <button id="medium-term" onClick={(e) => trackSwitch(e)}>Medium-term (6 months)</button>
            <button id="long-term" onClick={(e) => trackSwitch(e)}>Long-term (12 months)</button>
          </div>
        </div>
        <div className="profile-top-genres">
          <h2>Top Genres</h2>
          {showGenresShort && (
            <div>
              <h4>Short-term (4 weeks)</h4>
              <p>
                {topGenresShort.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </p>
            </div>
          )}
          {showGenresMedium && (
            <div>
              <h4>Medium-term (6 months)</h4>
              <p>
                {topGenresMedium.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </p>
            </div>
          )}
          {showGenresLong && (
            <div>
              <h4>Long-term (12 months)</h4>
              <p>
                {topGenresLong.map((genre) => (
                  <li key={genre}>{genre}</li>
                ))}
              </p>
            </div>
          )}
          <div className="top-buttons">
            <button id="short-term" onClick={(e) => genreSwitch(e)}>Short-term (4 weeks)</button>
            <button id="medium-term" onClick={(e) => genreSwitch(e)}>Medium-term (6 months)</button>
            <button id="long-term" onClick={(e) => genreSwitch(e)}>Long-term (12 months)</button>
          </div>
        </div>
      </div>
      <div className="posters">
        <h2>Saved Compilation Posters</h2>
        <h5>Right-click to delete (PERMANENT)</h5>
        {showInfo && userInfo.posters && userInfo.posters.length > 0 ? (
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
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default Profile;
