import { useEffect } from "react";
import { SPOTIFY_CLIENT_ID } from "../env";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      const userInfoInput = {
        id: data.id,
        email: data.email,
        username: data.display_name,
        account: data.external_urls.spotify,
        image: data.images[0].url,
      };

      getProfile(userInfoInput);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  const getProfile = async (userInfoInput) => {
    try {
      const queryString = new URLSearchParams(userInfoInput).toString();

      const userInfoOutput = await axios.get(`http://localhost:3001/api/get-user?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      window.localStorage.setItem("userId", userInfoInput.id);
      window.localStorage.setItem("username", userInfoInput.username);
      window.localStorage.setItem("email", userInfoInput.email);
      window.localStorage.setItem("account", userInfoInput.account);
      window.localStorage.setItem("image", userInfoInput.image);
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
      <button
        style={{
          backgroundColor: "#1DB954",
          color: "white",
          padding: "15px 30px",
          border: "none",
          borderRadius: "30px",
          cursor: "pointer",
          fontFamily: "inherit",
        }}
        onClick={login}>
        Login to Spotify
      </button>
    </div>
  );
}

export default App;
