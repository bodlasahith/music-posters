import { useEffect } from "react";
import { SPOTIFY_CLIENT_ID } from "../env.js";
import { useNavigate } from "react-router-dom";

function App() {
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const scopes = [
    "user-read-email",
    "user-library-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    "user-top-read",
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      let token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);

      getUserInfo(token);
      navigate("/home");
    }
  }, [navigate]);

  const getUserInfo = async (token) => {
    try {
      const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      window.localStorage.setItem("userId", data.id);
      window.localStorage.setItem("email", data.email);
      window.localStorage.setItem("username", data.display_name);
      window.localStorage.setItem("account", data.external_urls.spotify);
      window.localStorage.setItem("image", data.images[0].url);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const login = () => {
    const scopeUrlParam = scopes.join("%20");
    const spotifyAuthUrl = `${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${scopeUrlParam}&response_type=${RESPONSE_TYPE}&show_dialog=true`;

    window.location.href = spotifyAuthUrl;
  };

  return (
    <div className="landing">
      <h1>Music Posters</h1>
      <button onClick={login}>Login to Spotify</button>
    </div>
  );
}

export default App;
