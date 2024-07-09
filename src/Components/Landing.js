import { useEffect, useState } from "react";
import { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } from "../env";

function App() {
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const scopes = [
    "user-read-email",
    "user-library-read",
    "user-read-recently-played",
    "user-top-read",
    "playlist-read-private",
    "playlist-read-collaborative",
    "playlist-modify-public",
  ];

  const [token, setToken] = useState("");
  const [artists, setArtists] = useState([]);
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
  }, []);

  const login = () => {
    const scopeUrlParam = scopes.join("%20");
    const spotifyAuthUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${scopeUrlParam}&response_type=${RESPONSE_TYPE}&show_dialog=true`;

    window.location.href = spotifyAuthUrl;
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  useEffect(() => {
    const fetchArtistsAndTracks = async () => {
      const response = await fetch(
        `https://api.spotify.com/v1/me/top/artists?time_range=long_term&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setArtists(data.items);
  
      const response2 = await fetch(
        `https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data2 = await response2.json();
      setTracks(data2.items);
    };

    if (token) {
      fetchArtistsAndTracks();
    }
  }, [token]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Posters</h1>
        {!token ? (
          <button onClick={login}>Login to Spotify</button>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </header>
    </div>
  );
}

export default App;
