import React from "react";
import Navbar from "../Navigation/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Landing.css"; // Import custom styles
import { FaGlasses } from "react-icons/fa"; // Import vector icon
import { motion } from "framer-motion"; // For animations

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <header className="hero-section d-flex align-items-center justify-content-center text-center position-relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <FaGlasses className="icon text-white mb-3" size={50} />
            <h1 className="display-4 text-white fw-bold">Welcome to EyeWear</h1>
            <p className="lead text-white">
              Discover the perfect glasses to enhance your vision and style.
            </p>
            <a href="/glasses" className="btn btn-primary btn-lg mt-3 shadow-sm">
              Shop Now
            </a>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="vector-bg"
        ></motion.div>
      </header>
    </>
  );
};

export default LandingPage;
