import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import Navbar from "../Navigation/Navbar";
import { useNavigate } from "react-router-dom";
import reqIcon from "../assets/req.png";
import styles from "./Requirements.module.css"; // Import CSS Module
import "../Process/LoginModal.css"; // Import the CSS file
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
    <div className={styles.minHscreen}>
      <Navbar />

      <section className={styles.textCenter}>
        <div className={styles.container}>
          <div className={styles.requirementsBox}>
            <div className={styles.requirementsContent}>
              <img src={reqIcon} alt="Requirements Icon" className={styles.reqIcon} />

              <div className={styles.requirementsText}>
                <h2 className={styles.requirementsHeading}>Requirements</h2>
                <p className={styles.requirementsParagraph}>
                  Here are the requirements for the project:
                </p>

                <ul className={styles.requirementsList}>
                  <li>Device’s integrated CAMERA or external camera</li>
                  <li>Device’s integrated MICROPHONE or any external microphone</li>
                </ul>

                <div className={styles.requirementsNote}>
                  <p>
                    Make sure to fulfill all the necessary requirements before starting the project.
                  </p>
                </div>
              </div>
            </div>

            <button className={styles.nextBtn} onClick={handleNextClick}>
              <FaArrowRight size={50} />
            </button>
          </div>
        </div>
      </section>

      {isLoginPromptOpen && (
          <div className="optical-shops-login-modal-overlay">
            <div className="optical-shops-login-modal-content">
              <h2>Login Required</h2>
              <p>You need to login first to use this feature.</p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="optical-shops-login-close-button"
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