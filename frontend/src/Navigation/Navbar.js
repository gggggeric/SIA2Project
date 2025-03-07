import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Glasses, Eye, MapPin, User, Edit, LogOut, X } from "lucide-react"; // Icons
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Navbar.css";
import logo from "../assets/logoOpticAI (2).png"; // Adjust path if needed
import profileImage from "../assets/profile.jpg"; // Import the profile image

const Navbar = () => {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");
  
  // Get email from localStorage
  const userEmail = localStorage.getItem("email");
  
  // State to manage the sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("email");  // Ensure email is also cleared on logout
    console.log("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container-fluid custom-container">
          {/* Hamburger Menu (For All Users) */}
          {isLoggedIn && (
            <button className="hamburger-menu" onClick={() => setSidebarOpen(true)}>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </button>
          )}

          {/* Centered Logo */}
          <div className="navbar-center">
            <Link className="navbar-brand text-white d-flex align-items-center" to={isLoggedIn ? (userType === "admin" ? "/adminHome" : "/home") : "/"}> 
              <img src={logo} alt="OpticAI Logo" className="navbar-logo" />
              <span className="brand-text">OpticAI</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isLoggedIn && (
                <>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to={userType === "admin" ? "/adminHome" : "/home"}>Home</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link text-white" to="/about">About</Link>
                  </li>
                </>
              )}
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
            </ul>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        {/* Close Button */}
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>

        <ul className="sidebar-menu">
          {/* User Profile Section */}
          {isLoggedIn && (
            <div className="sidebar-profile">
              <img src={profileImage} alt="Profile" className="sidebar-profile-img" /> {/* Use the imported image */}
              <p className="sidebar-profile-email">{userEmail}</p>
            </div>
          )}

          {/* Services Section */}
          <li className="sidebar-section-title">Services</li>
          <li className="sidebar-item">
            <Link to="/process/faceshape-detector" onClick={() => setSidebarOpen(false)}>
              <Glasses size={20} className="sidebar-icon" /> Eye Glass Frame Analyzer
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/instructions/reminders" onClick={() => setSidebarOpen(false)}>
              <Eye size={20} className="sidebar-icon" /> Proceed to Testing the Eye Sight
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/process/near-opticalshops" onClick={() => setSidebarOpen(false)}>
              <MapPin size={20} className="sidebar-icon" /> View All the Near Optical Shops
            </Link>
          </li>

          <hr className="sidebar-separator" />

          {/* Manage Section (Only for Admins) */}
          {isLoggedIn && userType === "admin" && (
            <>
              <li className="sidebar-section-title">Manage</li>
              <li className="sidebar-item">
                <Link to="/admin/manage-users" onClick={() => setSidebarOpen(false)}>
                  <User size={20} className="sidebar-icon" /> Manage Users
                </Link>
              </li>
              <li className="sidebar-item">
                <Link to="/admin/deactivate-users" onClick={() => setSidebarOpen(false)}>
                  <User size={20} className="sidebar-icon" /> Deactivate Users
                </Link>
              </li>
              <hr className="sidebar-separator" />
            </>
          )}

          {/* "You" Section (For All Users) */}
          {isLoggedIn && (
            <>
              <li className="sidebar-section-title">You</li>
              <li className="sidebar-item">
                <Link to="/profile/edit" onClick={() => setSidebarOpen(false)}>
                  <Edit size={20} className="sidebar-icon" /> Edit Profile
                </Link>
              </li>
              <hr className="sidebar-separator" />
            </>
          )}

          {/* Logout Button (For All Users) */}
          {isLoggedIn && (
            <li className="sidebar-item logout">
              <button onClick={handleLogout}>
                <LogOut size={20} className="sidebar-icon" /> Logout
              </button>
            </li>
          )}
        </ul>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Navbar;
