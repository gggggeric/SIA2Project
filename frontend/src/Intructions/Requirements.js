import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Navbar from "../Navigation/Navbar";
import { useNavigate } from "react-router-dom";
import reqIcon from "../assets/req.png";
import "./Requirements.css";

const RequirementsPage = () => {
  const navigate = useNavigate();
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("token"); 

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
    }
  }, [isLoggedIn]);

  const handleNextClick = () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true); 
      return;
    }
    navigate("/instructions/reminders");
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar />

      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="requirements-box">
            <div className="requirements-content">
              <img src={reqIcon} alt="Requirements Icon" className="req-icon" />

              <div className="requirements-text">
                <h2 className="requirements-heading">Requirements</h2>
                <p className="requirements-paragraph">
                  Here are the requirements for the project:
                </p>

                <ul className="requirements-list">
                  <li>Device’s integrated CAMERA or external camera</li>
                  <li>Device’s integrated MICROPHONE or any external microphone</li>
                </ul>

                <div className="requirements-note">
                  <p>
                    Make sure to fulfill all the necessary requirements before starting the project.
                  </p>
                </div>
              </div>
            </div>

            <button className="next-btn" onClick={handleNextClick}>
              <FaArrowRight size={50} />
            </button>
          </div>
        </div>
      </section>

      {isLoginPromptOpen && (
        <div className="requirements-login-modal-overlay">
          <div className="requirements-login-modal-content">
            <h2>Login Required</h2>
            <p>You need to login first to proceed.</p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="requirements-login-close-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequirementsPage;
