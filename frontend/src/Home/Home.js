import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navigation/Navbar";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      navigate("/"); // Redirect to login if no token found
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar />

      <section className="text-center p-10">
        <h2 className="text-4xl font-bold text-gray-800">Welcome to My Website</h2>
        <p className="text-gray-600 mt-4">A modern web experience with a sleek design.</p>
        <button className="mt-6 bg-[#38b6ff] text-white px-6 py-2 rounded-md shadow-md hover:bg-blue-400">
          Get Started
        </button>
      </section>
    </div>
  );
};

export default HomePage;
