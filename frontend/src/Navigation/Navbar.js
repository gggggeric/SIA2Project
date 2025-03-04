import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Navbar.css";

// Import the logo
import logo from "../assets/logoOpticAI (2).png"; // Adjust the path if necessary

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const userType = localStorage.getItem("userType"); // Get userType from localStorage

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType"); // Clear userType on logout
    console.log("Token and userType removed successfully");
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light fixed-top">
      <div className="container-fluid custom-container">
        {/* Left Section (Empty for spacing) */}
        <div className="navbar-left"></div>

        {/* Centered Brand Name with Logo */}
        <Link className="navbar-brand text-white mx-auto d-flex align-items-center" to={isLoggedIn ? (userType === "admin" ? "/adminHome" : "/home") : "/"}>
          <img src={logo} alt="OpticAI Logo" className="navbar-logo me-2" />
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
            {/* Admin View - Show ONLY Logout */}
            {isLoggedIn && userType === "admin" ? (
              <li className="nav-item">
                <button className="nav-link text-danger" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            ) : (
              <>
                {/* Home (Visible if logged in) */}
                {isLoggedIn && (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/home">
                      Home
                    </Link>
                  </li>
                )}

                {/* About (Hidden for admin) */}
                {!isLoggedIn || userType !== "admin" ? (
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/about">
                      About
                    </Link>
                  </li>
                ) : null}

                {/* Profile Dropdown (Only for logged-in users, but not admins) */}
                {isLoggedIn && userType !== "admin" && (
                  <li className="nav-item dropdown">
                    <Link
                      className="nav-link text-white dropdown-toggle"
                      id="profileDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      to="#"
                    >
                      Profile
                    </Link>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                      <li>
                        <button className="dropdown-item" onClick={() => navigate("/process/faceshape-detector")}>Eye Glass Frame Analyzer</button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={() => navigate("/instructions/reminders")}>Proceed to Testing the Eye Sight</button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={() => navigate("/process/near-opticalshops")}>View All the Near Optical Shops</button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                      </li>
                    </ul>
                  </li>
                )}

                {/* Guest (Login & Signup) */}
                {!isLoggedIn && (
                  <>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/login">Login</Link>
                    </li>
                    <li className="nav-item">
                      <Link className="nav-link text-white" to="/signup">Signup</Link>
                    </li>
                  </>
                )}
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
