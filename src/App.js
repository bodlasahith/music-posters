import "./App.css";
import { Spotify, MusicNoteBeamed } from "react-bootstrap-icons";

function App() {
  return (
    <div className="App">
      <h1 id="title">
        Generate posters of your top artists/tracks/albums here!
      </h1>
      <div className="buttons">
        <button id="spotify">
          <Spotify className="logo"></Spotify>
          Login with Spotify!
        </button>
        <button id="apple-music">
          <MusicNoteBeamed className="logo"></MusicNoteBeamed>
          Login with Apple Music!
        </button>
      </div>
    </div>
  );
}

export default App;
