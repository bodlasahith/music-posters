import React from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const logout = () => {
    window.localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="profile">
      <h1>Profile</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

export default Profile;
