import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Glasses, Eye, MapPin, User, Edit, LogOut, X, MessageCircle } from "lucide-react"; // Added MessageCircle icon
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./Navbar.css";
import defaultProfile from '../assets/profile.jpg'; // Import the default profile image
import { ToastContainer, toast } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("token");
  const userType = localStorage.getItem("userType");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUserData = async () => {
      if (isLoggedIn) {
        const userId = localStorage.getItem("userId");
        if (userId) {
          try {
            const response = await fetch(`http://localhost:5001/users/users/${userId}`);
            const data = await response.json();
            if (data) {
              // If the profile picture is an empty string, use the default image
              data.profile = data.profile || defaultProfile; // Use the imported default image
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    console.log("Logged out successfully");

    // Show success toast
    toast.success("Successfully logged out!", {
      position: "bottom-right",
      autoClose: 3000, // Toast will auto-close after 3 seconds
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });

    // Navigate to home page after a short delay
    setTimeout(() => {
      navigate("/");
      window.location.reload(); // Reload the page after logout
    }, 3000); // Match this delay with the toast's autoClose duration
  };

  return (
    <>
      {/* Add ToastContainer to display toasts */}
      <ToastContainer />

      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container-fluid custom-container">
          <button className="hamburger-menu" onClick={() => setSidebarOpen(true)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </button>

          <div className={`navbar-brand ${isLoggedIn ? "with-sidebar" : "no-sidebar"}`}>
            <Link
              className="text-white"
              to={isLoggedIn ? (userType === "admin" ? "/adminHome" : "/") : "/"}
            >
              <span className="brand-text">OpticAI</span>
            </Link>
          </div>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {isLoggedIn && (
                <>
                  <li className={`nav-item ${isActive("/") ? "active" : ""}`}>
                    <Link
                      className="nav-link text-white"
                      to={userType === "admin" ? "/adminHome" : "/"}
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

      <div className={`sidebar ${sidebarOpen ? "active" : ""}`}>
        <button className="close-btn" onClick={() => setSidebarOpen(false)}>
          <X size={24} />
        </button>

        <ul className="sidebar-menu">
          {isLoggedIn && userData && (
            <div className="sidebar-profile">
              <img
                src={userData.profile} // This will always be a valid URL or the default image
                alt="Profile"
                className="sidebar-profile-img"
              />
              <p className="sidebar-profile-name">{userData.name}</p>
              <p className="sidebar-profile-email">{userData.email}</p>
            </div>
          )}

          {/* Conditionally render Services section for non-admin users and non-logged-in users */}
          {(isLoggedIn && userType !== "admin") || !isLoggedIn ? (
            <>
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
            </>
          ) : null}

          {!isLoggedIn && (
            <>
              <hr className="sidebar-separator" />
              <li className={`sidebar-item ${isActive("/about") ? "active" : ""}`}>
                <Link className="nav-link text-white" to="/about">About</Link>
              </li>
            </>
          )}

          {isLoggedIn && userType === "admin" && (
            <>
              <hr className="sidebar-separator" />
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
              {/* Add a new link for managing reviews */}
              <li className="sidebar-item">
                <Link to="/adminReply" onClick={() => setSidebarOpen(false)}>
                  <MessageCircle size={20} className="sidebar-icon" /> Manage Reviews
                </Link>
              </li>
            </>
          )}

          {isLoggedIn && (
            <>
              <hr className="sidebar-separator" />
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

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}
    </>
  );
};

export default Navbar;