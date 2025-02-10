import React from "react";
import { FaArrowRight } from "react-icons/fa";
import Navbar from "../Navigation/Navbar"; 
import { useNavigate } from "react-router-dom"; 
import reqIcon from "../assets/req.png"; 
import "./Requirements.css"; 

const RequirementsPage = () => {
  const navigate = useNavigate(); 


  const handleNextClick = () => {
    navigate("/instructions/reminders");
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> 

      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="requirements-box">
            <div className="requirements-content">
              {/* Left-side Image (Larger than text) */}
              <img src={reqIcon} alt="Requirements Icon" className="req-icon" />

              {/* Right-side Content */}
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

            {/* Next Arrow Button */}
            <button className="next-btn" onClick={handleNextClick}>
              <FaArrowRight size={50} /> 
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RequirementsPage;
