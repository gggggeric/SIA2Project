import React from "react";
import { useNavigate } from "react-router-dom";
import { FaGlasses, FaEye, FaMapMarkerAlt } from "react-icons/fa"; // Import icons
import Navbar from "../Navigation/Navbar";
import eyeTestImage from "../assets/personwithdashboard2.png"; // Import image
import "./Home.css"; // Import CSS file

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <Navbar />

      {/* Main Content Layout */}
      <div className="dashboard-container">
        {/* Left Side - Image & Description */}
        <div className="info-section">
          <img src={eyeTestImage} alt="Eye Test" className="dashboard-image" />
        </div>

        {/* Right Side - Buttons for Navigation */}
        <div className="dashboard-buttons">
          <h2>Dashboard</h2>
          <p>Select a feature to begin:</p>

          <button onClick={() => navigate("/process/faceshape-detector")} className="dashboard-btn">
            <FaGlasses className="btn-icon" /> Eye Glass Frame Analyzer
          </button>

          <button onClick={() => navigate("/instructions/reminders")} className="dashboard-btn">
            <FaEye className="btn-icon" /> Proceed to Testing the Eye Sight
          </button>

          <button onClick={() => navigate("/process/near-opticalshops")} className="dashboard-btn">
            <FaMapMarkerAlt className="btn-icon" /> View All the Near Optical Shops
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
