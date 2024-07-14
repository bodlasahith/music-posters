import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Landing from "./Components/Landing";
import NavBar from "./Components/Navbar";
import AIPoster from "./Components/AIPoster";
import CompilationPoster from "./Components/CompilationPoster";
import TracklistPoster from "./Components/TracklistPoster";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Landing />} />
          <Route path="/compilation-poster" element={<CompilationPoster />} />
          <Route path="/aiposter" element={<AIPoster />} />
          <Route path="/tracklist-poster" element={<TracklistPoster />} />
          <Route path="*" element={<h1>PAGE NOT FOUND</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
