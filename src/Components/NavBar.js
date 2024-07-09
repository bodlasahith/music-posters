import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <div className="NavBar">
      <Link to="/home">Home</Link>
    </div>
  );
}

export default NavBar;
