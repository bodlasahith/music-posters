import React from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { HouseDoor, BoxArrowLeft, FilePlus, FileMusic, Stars } from "react-bootstrap-icons";

function NavBar() {
  const navigate = useNavigate();

  const logout = () => {
    window.localStorage.removeItem("token");
    navigate("/");
  };

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
          <FilePlus />
          <p>Compilation Poster</p>
        </div>
      </Link>
      <Link className="nav-link" to="/aiposter">
        <div className="nav-button">
          <Stars />
          <p>AI Poster</p>
        </div>
      </Link>
      <Link className="nav-link" to="/" onClick={logout}>
        <div className="nav-button">
          <BoxArrowLeft />
          <p>Logout</p>
        </div>
      </Link>
    </div>
  );
}

export default NavBar;
