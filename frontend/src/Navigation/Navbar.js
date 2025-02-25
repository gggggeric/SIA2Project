import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { 
  FaUser, FaHome, FaInfoCircle, 
  FaSignInAlt, FaUserPlus 
} from "react-icons/fa";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    console.log("Token removed successfully");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container-fluid custom-container">
        {/* Left Section (Empty for spacing) */}
        <div className="navbar-left"></div>

        {/* Centered Brand Name */}
        <Link className="navbar-brand text-white mx-auto" to={isLoggedIn ? "/home" : "/"}>
          OpticAI
        </Link>

        {/* Toggle Button for Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {isLoggedIn && (
              <li className="nav-item">
                <Link className="nav-link text-white d-flex align-items-center" to="/home">
                  <FaHome size={22} className="me-1" /> Home
                </Link>
              </li>
            )}

            <li className="nav-item">
              <Link className="nav-link text-white d-flex align-items-center" to="/about">
                <FaInfoCircle size={22} className="me-1" /> About
              </Link>
            </li>

            {isLoggedIn ? (
              <li className="nav-item dropdown">
                <Link
                  className="nav-link text-white dropdown-toggle d-flex align-items-center"
                  id="profileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  to="#"
                >
                  <FaUser size={22} className="me-1" /> Profile
                </Link>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link text-white d-flex align-items-center" to="/login">
                    <FaSignInAlt size={22} className="me-1" /> Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link text-white d-flex align-items-center" to="/signup">
                    <FaUserPlus size={22} className="me-1" /> Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
