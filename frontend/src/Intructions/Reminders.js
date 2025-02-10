import React from "react";
import { FaArrowRight } from "react-icons/fa"; 
import Navbar from "../Navigation/Navbar"; 
import { useNavigate } from "react-router-dom"; 
import reminderIcon from "../assets/rem.png";
import "./Reminders.css"; 

const RemindersPage = () => {
  const navigate = useNavigate();

  const handleNextClick = () => {
    navigate("/process/both-eye"); 
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> 

      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="reminders-box">
            <div className="reminders-content">

              <img src={reminderIcon} alt="Reminder Icon" className="reminder-icon" />


              <div className="reminders-text">
                <h2 className="text-2xl font-bold mb-4">Reminders</h2>
                <p className="text-lg mb-4">Here are some important reminders:</p>

                <ul className="reminders-list">
                  <li>Conduct the process in a room with good lighting (for face detection).</li>
                  <li>Proceed in a room with less noise and a comfortable place.</li>
                </ul>

                <div className="reminders-note">
                  <p>These reminders will help you have a smooth experience during the session.</p>
                </div>
              </div>
            </div>

            <button className="next-btn" onClick={handleNextClick}>
              <FaArrowRight size={50} /> {/* Large Icon */}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default RemindersPage;
