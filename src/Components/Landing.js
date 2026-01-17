import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const REDIRECT_URI = "https://music-posters.vercel.app/callback";
  // const REDIRECT_URI = "http://127.0.0.1:3000/callback";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
  const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const scopes = [
    "user-read-email",
    "user-library-read",
    "user-read-recently-played",
    "user-read-currently-playing",
    "user-top-read",
  ];
  const navigate = useNavigate();

  // Generate code verifier and challenge for PKCE
  const generateRandomString = (length) => {
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  };

  const sha256 = async (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data);
  };

  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  useEffect(() => {
    const exchangeCodeForToken = async (code, codeVerifier) => {
      const payload = {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: SPOTIFY_CLIENT_ID,
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: codeVerifier,
        }),
      };

      try {
        const response = await fetch(TOKEN_ENDPOINT, payload);
        const data = await response.json();

        if (data.access_token) {
          localStorage.removeItem("code_verifier");
          localStorage.setItem("token", data.access_token);

          if (data.refresh_token) {
            localStorage.setItem("refresh_token", data.refresh_token);
          }

          await getUserInfo(data.access_token);
          navigate("/home");
        }
      } catch (error) {
        console.error("Error exchanging code for token:", error);
      }
    };

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      console.error("Spotify auth error:", error);
      alert(`Authentication error: ${error}. Please check your Spotify app settings.`);
      return;
    }

    if (code) {
      const codeVerifier = localStorage.getItem("code_verifier");
      if (codeVerifier) {
        exchangeCodeForToken(code, codeVerifier);
      }
    }
  }, [navigate, SPOTIFY_CLIENT_ID]);

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

  const login = async () => {
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    localStorage.setItem("code_verifier", codeVerifier);

    const scopeUrlParam = scopes.join(" ");
    const authUrl = new URL(AUTH_ENDPOINT);

    const params = {
      response_type: "code",
      client_id: SPOTIFY_CLIENT_ID,
      scope: scopeUrlParam,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      redirect_uri: REDIRECT_URI,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  };

  return (
    <div className="landing">
      <h1>Music Posters</h1>
      <button onClick={login}>Login to Spotify</button>
    </div>
  );
}

export default App;
