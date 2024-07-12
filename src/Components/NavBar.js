import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div className="nav-bar">
      <Link to="/home">Home</Link>
    </div>
  );
}

export default NavBar;
