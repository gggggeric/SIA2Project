import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Glasses, Eye, MapPin, User, Edit, LogOut, X } from "lucide-react"; // Icons
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current path
  const isLoggedIn = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  // Function to check active path
  const isActive = (path) => location.pathname === path;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn) {
        const userId = localStorage.getItem("userId");
        if (userId) {
          try {
            const response = await fetch(`http://localhost:5001/users/users/${userId}`);
            const data = await response.json();
            if (data) {
              setUserData(data);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
      }
    };

    fetchUserData();
  }, [isLoggedIn]);

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    console.log("Logged out successfully");
    navigate("/");
  };

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container-fluid custom-container">

          {/* Sidebar Button (Now Visible to Everyone) */}
          <button className="hamburger-menu" onClick={() => setSidebarOpen(true)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>

          {/* OpticAI Branding */}
          <div className={`navbar-brand ${isLoggedIn ? "with-sidebar" : "no-sidebar"}`}>
            <Link
              className="text-white"
              to={isLoggedIn ? (userType === "admin" ? "/adminHome" : "/home") : "/"}
            >
              <span className="brand-text">OpticAI</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isLoggedIn && (
                <>
                  <li className={`nav-item ${isActive("/home") ? "active" : ""}`}>
                    <Link
                      className="nav-link text-white"
                      to={userType === "admin" ? "/adminHome" : "/home"}
                    >
                      Home
                    </Link>
                  </li>
                  <li className={`nav-item ${isActive("/about") ? "active" : ""}`}>
                    <Link className="nav-link text-white" to="/about">About</Link>
                  </li>
                </>
              )}
              {!isLoggedIn && (
                <>
                  <li className={`nav-item ${isActive("/login") ? "active" : ""}`}>
                    <Link className="nav-link text-white" to="/login">Login</Link>
                  </li>
                  <li className={`nav-item ${isActive("/signup") ? "active" : ""}`}>
                    <Link className="nav-link text-white" to="/signup">Signup</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Sidebar (Now Always Accessible) */}
      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>

        <ul className="sidebar-menu">
          {/* Show profile data if user is logged in */}
          {isLoggedIn && userData && (
            <div className="sidebar-profile">
              <img src={userData.profile} alt="Profile" className="sidebar-profile-img" />
              <p className="sidebar-profile-name">{userData.name}</p>
              <p className="sidebar-profile-email">{userData.email}</p>
            </div>
          )}

          {/* Services (Now Always Visible) */}
          <li className="sidebar-section-title">Services</li>
          <li className="sidebar-item">
            <Link to="/process/faceshape-detector" onClick={() => setSidebarOpen(false)}>
              <Glasses size={20} className="sidebar-icon" /> Eye Glass Frame Analyzer
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/instructions/requirements" onClick={() => setSidebarOpen(false)}>
              <Eye size={20} className="sidebar-icon" /> Proceed to Testing the Eye Sight
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to="/process/near-opticalshops" onClick={() => setSidebarOpen(false)}>
              <MapPin size={20} className="sidebar-icon" /> View All the Near Optical Shops
            </Link>
          </li>
          <hr className="sidebar-separator" />

          {/* Admin Options (Only for Admins) */}
          {isLoggedIn && userType === "admin" && (
            <>
              <li className="sidebar-section-title">Manage</li>
              <li className="sidebar-item">
                <Link to="/adminUserCRUD" onClick={() => setSidebarOpen(false)}>
                  <User size={20} className="sidebar-icon" /> Manage Users
                </Link>
              </li>
              <li className="sidebar-item">
                <Link to="/adminUserActivation" onClick={() => setSidebarOpen(false)}>
                  <User size={20} className="sidebar-icon" /> Deactivate Users
                </Link>
              </li>
              <hr className="sidebar-separator" />
            </>
          )}

          {/* User Actions (Only for Logged-in Users) */}
          {isLoggedIn && (
            <>
              <li className="sidebar-section-title">You</li>
              <li className="sidebar-item">
                <Link to="/edit-profile" onClick={() => setSidebarOpen(false)}>
                  <Edit size={20} className="sidebar-icon" /> Edit Profile
                </Link>
              </li>
              <hr className="sidebar-separator" />
              <li className="sidebar-item logout">
                <button onClick={handleLogout}>
                  <LogOut size={20} className="sidebar-icon" /> Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Navbar;
