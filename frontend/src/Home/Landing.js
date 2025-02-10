import React from "react";
import Navbar from "../Navigation/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Landing.css";
import { motion } from "framer-motion";
import logo from "../assets/landing.png"; // Import the logo

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <header className="hero-section d-flex align-items-center justify-content-center text-center position-relative vh-100">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-left text-md-start text-container"
          >
            <h1 className="display-4 fw-bold">Welcome to OpticAI</h1>
            <p className="lead">
              Empowering Vision Enhancing Care
            </p>
            <a href="/login" className="btn btn-primary btn-lg mt-3 shadow-sm">
              Get Started
            </a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="logo-container"
          >
            <div className="logo-box p-4 shadow-sm rounded">
              <img src={logo} alt="EyeWear Logo" className="logo-img img-fluid" />
            </div>
          </motion.div>
        </div>
      </header>
    </>
  );
};

export default LandingPage;
