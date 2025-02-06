import React from "react";
import { FaArrowRight } from "react-icons/fa"; // Importing the right arrow icon from react-icons
import Navbar from "../Navigation/Navbar"; // Assuming you have a Navbar component
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import './Requirements.css'; // Create a custom CSS file for styling

const RequirementsPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Function to handle the button click and redirect to reminders page
  const handleNextClick = () => {
    navigate("/instructions/reminders");
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> {/* Your Navbar */}
      
      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="requirements-box">
            <h2 className="text-2xl font-bold mb-4">Requirements</h2>
            <p className="text-lg mb-4">Here are the requirements for the project:</p>

            <ul className="text-left">
              <li>Device’s integrated CAMERA or external camera</li>
              <li>Device’s integrated MICROPHONE or any external microphone</li>
            </ul>

            {/* Example of additional content */}
            <div className="mt-4">
              <p>Make sure to fulfill all the necessary requirements before starting the project.</p>
            </div>

            {/* Next Arrow Button */}
            <button className="next-btn" onClick={handleNextClick}>
              <FaArrowRight size={18} className="text-white" /> {/* Right Arrow Icon (smaller size) */}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RequirementsPage;
