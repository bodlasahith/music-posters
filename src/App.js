import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import Landing from "./Components/Landing";
import NavBar from "./Components/NavBar";
import CompilationPoster from "./Components/CompilationPoster";
import TracklistPoster from "./Components/TracklistPoster";
import Profile from "./Components/Profile";
import Topster from "./Components/Topster";
import TasteProfile from "./Components/TasteProfile";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Landing />} />
          <Route path="/callback" element={<Landing />} />
          <Route path="/compilation-poster" element={<CompilationPoster />} />
          <Route path="/taste-profile" element={<TasteProfile />} />
          <Route path="/tracklist-poster" element={<TracklistPoster />} />
          <Route path="/topster" element={<Topster />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<h1>PAGE NOT FOUND</h1>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
