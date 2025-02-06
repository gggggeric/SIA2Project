import React from "react";
import { FaArrowRight } from "react-icons/fa"; // Importing the right arrow icon from react-icons
import Navbar from "../Navigation/Navbar"; // Assuming you have a Navbar component
import './BothEye.css'; // Custom CSS for styling

const BothEyePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> {/* Your Navbar */}

      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="both-eye-box">
            <h2 className="text-2xl font-bold mb-4">Both Eye Process</h2>
            <p className="text-lg mb-4">Follow the steps to proceed with the process.</p>

            <ul className="text-left">
              <li>Ensure both eyes are properly positioned in the camera view</li>
              <li>Make sure there is enough lighting for proper eye detection</li>
              <li>Follow the on-screen instructions for optimal results</li>
            </ul>

            {/* Additional Content */}
            <div className="mt-4">
              <p>This process will guide you through a smooth and efficient experience.</p>
            </div>

            {/* Next Arrow Button */}
          
          </div>
        </div>
      </section>
    </div>
  );
};

export default BothEyePage;
