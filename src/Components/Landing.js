import { useEffect, useState } from "react";
import { SPOTIFY_CLIENT_ID } from "../env";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

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
    if (token) {
      navigate("/home");
    }
  }, [navigate]);

  const login = () => {
    const scopeUrlParam = scopes.join("%20");
    const spotifyAuthUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${scopeUrlParam}&response_type=${RESPONSE_TYPE}&show_dialog=true`;

    window.location.href = spotifyAuthUrl;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Posters</h1>
        {!token ? <button onClick={login}>Login to Spotify</button> : null}
      </header>
    </div>
  );
}

export default App;
