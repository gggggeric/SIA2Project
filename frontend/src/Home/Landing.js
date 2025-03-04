import React from "react";
import Navbar from "../Navigation/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Landing.css";
import { motion } from "framer-motion";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      {/* Fullscreen Background Video with Gradient Overlay */}
      <div className="video-container">
        <video autoPlay loop muted className="bg-video">
          <source src={require("../assets/video1.mp4")} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="video-overlay"></div> {/* Gradient Overlay */}
      </div>

      <header className="hero-section">
        <div className="text-container">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="display-4 fw-bold">Welcome to OpticAI</h1>
            <p className="lead">Empowering Vision, Enhancing Care</p>
            <a href="/login" className="btn btn-primary btn-lg mt-3 shadow-sm">
              Get Started
            </a>
          </motion.div>
        </div>
      </header>
    </>
  );
};

export default LandingPage;
