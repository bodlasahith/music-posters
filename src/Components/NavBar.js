import React from "react";
import { Link } from "react-router-dom";
import { HouseDoor, BorderAll, FileMusic, Stars, PersonCircle } from "react-bootstrap-icons";

function NavBar() {
  return (
    <div className="nav-bar">
      <Link className="nav-link" to="/home">
        <div className="nav-button">
          <HouseDoor />
          <p>Home</p>
        </div>
      </Link>
      <Link className="nav-link" to="/tracklist-poster">
        <div className="nav-button">
          <FileMusic />
          <p>Tracklist Poster</p>
        </div>
      </Link>
      <Link className="nav-link" to="/compilation-poster">
        <div className="nav-button">
          <BorderAll />
          <p>Compilation Poster</p>
        </div>
      </Link>
      <Link className="nav-link" to="/aiposter">
        <div className="nav-button">
          <Stars />
          <p>AI Poster</p>
        </div>
      </Link>
      <Link className="nav-link" to="/profile">
        <div className="nav-button">
          <PersonCircle />
          <p>Profile</p>
        </div>
      </Link>
    </div>
  );
}

export default NavBar;
