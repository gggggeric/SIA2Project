import React from "react";
import { FaArrowRight } from "react-icons/fa"; // Importing the right arrow icon from react-icons
import Navbar from "../Navigation/Navbar"; // Assuming you have a Navbar component
import { useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import './Reminders.css'; // Create a custom CSS file for styling

const RemindersPage = () => {
  const navigate = useNavigate(); // Initialize navigate function

  const handleNextClick = () => {
    // Redirect to the desired path
    navigate("/process/both-eye"); // Redirect to the specified path
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> {/* Your Navbar */}
      
      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="reminders-box">
            <h2 className="text-2xl font-bold mb-4">Reminders</h2>
            <p className="text-lg mb-4">Here are some important reminders:</p>

            <ul className="text-left">
              <li>Conduct the process in a room with good lighting (for face detection)</li>
              <li>Proceed in a room with less noise and a comfortable place</li>
            </ul>

            {/* Example of additional content */}
            <div className="mt-4">
              <p>These reminders will help you have a smooth experience during the session.</p>
            </div>

            {/* Next Arrow Button */}
            <button 
              className="next-btn"
              onClick={handleNextClick} // Trigger the redirect when clicked
            >
              <FaArrowRight size={18} className="text-white" /> {/* Right Arrow Icon (smaller size) */}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RemindersPage;
