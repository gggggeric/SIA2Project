import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, Modal } from "@mui/material";
import Navbar from "../Navigation/Navbar";
import opticImage from "../assets/isometricImage.png";
import video1 from '../assets/video2.mp4';
import video2 from '../assets/video1.mp4';
import video3 from '../assets/video3.mp4';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import carouselImage1 from "../assets/homecaro1.jpg"; 
import carouselImage2 from "../assets/carousel2.jpg";
import carouselImage3 from "../assets/carousel3.jpg";
import landingGif from "../assets/GIF/gif.gif";
import faceShapeGif from '../assets/GIF/face.gif';
import eyeGradeGif from '../assets/GIF/gif3.gif';
import opticalShopGif from '../assets/GIF/loc.gif';
import astigmatismTestGif from "../assets/GIF/gif6.gif";
import colorBlindTestGif from "../assets/GIF/gif6.gif";

const HomePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("token");

  const handleOpen = (videoSrc) => {
    setSelectedVideo(videoSrc);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedVideo(null);
  };

  return (
    <Box sx={{ backgroundColor: "#f9f9f9", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          paddingTop: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: { xs: "4rem 1rem", sm: "5rem 2rem", md: "5rem 4rem" },
          flexDirection: { xs: "column-reverse", md: "row" },
          gap: { xs: "2rem", md: "0" },
        }}
      >
        {/* Left Side Content */}
        <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h3"
            sx={{
              color: "#2a2250",
              fontWeight: "bold",
              marginBottom: "1rem",
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Welcome to OpticAI!
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: "#2a2250",
              fontWeight: "500",
              marginBottom: "1rem",
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: "1.2rem", sm: "1.5rem", md: "1.8rem" },
            }}
          >
            Empowering Vision, Enhancing Care
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#555",
              marginBottom: "2rem",
              lineHeight: 1.6,
              fontFamily: "'Open Sans', sans-serif",
            }}
          >
            Optic AI transforms optical care using advanced AI to analyze face shapes for frame recommendations, 
            predict eye grades accurately, and find nearby optical shops within 5KM. 
            It offers personalized, seamless, and precise vision solutions in one platform.
          </Typography>

          {!isLoggedIn ? (
            <Button
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                backgroundColor: "#2a2250",
                "&:hover": { backgroundColor: "#1e1a3d" },
                padding: "0.8rem 2rem",
                borderRadius: "8px",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1rem",
                textTransform: "none",
                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              Get Started
            </Button>
          ) : (
            <Typography
              variant="h6"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                fontFamily: "'Poppins', sans-serif",
                padding: "0.8rem 2rem",
              }}
            >
              Welcome back! Explore our features.
            </Typography>
          )}
        </Box>

        {/* Right Side GIF */}
        <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, width: "100%" }}>
          <Paper
            elevation={12}
            sx={{
              padding: "1.5rem",
              borderRadius: "20px",
              backgroundColor: "#fff",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <img
              src={landingGif}
              alt="Optic AI Animated Illustration"
              style={{
                width: "100%",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "10px",
                backgroundColor: "#2a2250",
                borderTopLeftRadius: "20px",
                borderTopRightRadius: "20px",
              }}
            />
          </Paper>
        </Box>
      </Box>

      {/* What Our System Does Section */}
      <Box
        sx={{
          padding: { xs: "4rem 1rem", sm: "5rem 2rem", md: "6rem 4rem" },
          backgroundColor: "#fff",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#2a2250",
            fontWeight: "bold",
            marginBottom: "3rem",
            fontFamily: "'Poppins', sans-serif",
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
          }}
        >
          What Our System Does
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: "3rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Feature 1 */}
          <Paper
            elevation={6}
            sx={{
              padding: "2.5rem",
              borderRadius: "16px",
              maxWidth: "320px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <img
              src={faceShapeGif}
              alt="Analyze Face Shape GIF"
              style={{ width: "100%", borderRadius: "12px", marginBottom: "1.5rem" }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Analyze Face Shape
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}
            >
              Our system uses advanced facial recognition technology to analyze your face shape and
              recommend the perfect eyeglass frame that complements your features.
            </Typography>
          </Paper>

          {/* Feature 2 */}
          <Paper
            elevation={6}
            sx={{
              padding: "2.5rem",
              borderRadius: "16px",
              maxWidth: "320px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <img
              src={eyeGradeGif}
              alt="Predict Eye Grade GIF"
              style={{ width: "100%", borderRadius: "12px", marginBottom: "1.5rem" }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Predict Eye Grade
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}
            >
              Using cutting-edge AI algorithms, our system predicts your eye grade prescription with high
              accuracy. Simply input your data, and we'll provide a reliable estimate.
            </Typography>
          </Paper>

          {/* Feature 3 */}
          <Paper
            elevation={6}
            sx={{
              padding: "2.5rem",
              borderRadius: "16px",
              maxWidth: "320px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <img
              src={opticalShopGif}
              alt="Locate Optical Shops GIF"
              style={{ width: "100%", borderRadius: "12px", marginBottom: "1.5rem" }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Locate Optical Shops
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}
            >
              Need to find an optical shop nearby? Our system locates all optical shops within a 5KM
              radius, complete with directions and contact information.
            </Typography>
          </Paper>

          {/* Feature 4 - Astigmatism Test */}
          <Paper
            elevation={6}
            sx={{
              padding: "2.5rem",
              borderRadius: "16px",
              maxWidth: "320px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <img
              src={astigmatismTestGif}
              alt="Astigmatism Test GIF"
              style={{ width: "100%", borderRadius: "12px", marginBottom: "1.5rem" }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Astigmatism Test
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}
            >
              Our system includes a quick and easy astigmatism test to determine if you have astigmatism
              and provide recommendations for corrective lenses.
            </Typography>
          </Paper>

          {/* Feature 5 - Color Blindness Test */}
          <Paper
            elevation={6}
            sx={{
              padding: "2.5rem",
              borderRadius: "16px",
              maxWidth: "320px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <img
              src={colorBlindTestGif}
              alt="Color Blindness Test GIF"
              style={{ width: "100%", borderRadius: "12px", marginBottom: "1.5rem" }}
            />
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Color Blindness Test
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}
            >
              Take our color blindness test to identify any color vision deficiencies and receive guidance
              on how to manage and adapt to your condition.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Understanding Vision Types Section */}
      <Box
        sx={{
          padding: { xs: "4rem 1rem", sm: "5rem 2rem", md: "6rem 4rem" },
          backgroundColor: "#f9f9f9",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#2a2250",
            fontWeight: "bold",
            marginBottom: "3rem",
            fontFamily: "'Poppins', sans-serif",
            fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.5rem" },
          }}
        >
          Understanding Vision Types
        </Typography>

        {/* Topics Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: "2rem",
            justifyContent: "center",
          }}
        >
          {/* Topic 1: Nearsighted */}
          <Paper
            elevation={3}
            sx={{
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "300px",
              backgroundColor: "#fff",
              boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            {/* Video for Nearsighted */}
            <Box
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
              onClick={() => handleOpen(video1)}
            >
              <video
                style={{ width: "100%", borderRadius: "8px" }}
              >
                <source src={video1} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
            <Typography variant="h6" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1rem", fontFamily: "'Poppins', sans-serif" }}>
              Nearsighted
            </Typography>
            <Typography variant="body1" sx={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
              Nearsightedness, or myopia, makes distant objects appear blurry. Learn how our system helps you manage this condition effectively.
            </Typography>
          </Paper>

          {/* Topic 2: Farsighted */}
          <Paper
            elevation={3}
            sx={{
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "300px",
              backgroundColor: "#fff",
              boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            {/* Video for Farsighted */}
            <Box
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
              onClick={() => handleOpen(video2)}
            >
              <video
                style={{ width: "100%", borderRadius: "8px" }}
              >
                <source src={video2} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
            <Typography variant="h6" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1rem", fontFamily: "'Poppins', sans-serif" }}>
              Farsighted
            </Typography>
            <Typography variant="body1" sx={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
              Farsightedness, or hyperopia, makes close objects hard to see. Discover how our system can assist you in finding the right solution.
            </Typography>
          </Paper>

          {/* Topic 3: Normal Vision */}
          <Paper
            elevation={3}
            sx={{
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "300px",
              backgroundColor: "#fff",
              boxShadow: "0px 4px 16px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            {/* Video for Normal Vision */}
            <Box
              sx={{
                borderRadius: "8px",
                overflow: "hidden",
                marginBottom: "1rem",
                cursor: "pointer",
              }}
              onClick={() => handleOpen(video3)}
            >
              <video
                style={{ width: "100%", borderRadius: "8px" }}
              >
                <source src={video3} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </Box>
            <Typography variant="h6" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1rem", fontFamily: "'Poppins', sans-serif" }}>
              Normal Vision
            </Typography>
            <Typography variant="body1" sx={{ color: "#555", fontFamily: "'Open Sans', sans-serif" }}>
              Learn how to maintain normal vision and protect your eyesight with our expert tips and recommendations.
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Modal for Video */}
      <Modal
        open={modalOpen}
        onClose={handleClose}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "80%",
            maxWidth: "800px",
            outline: "none",
          }}
        >
          <video
            controls
            autoPlay
            style={{ width: "100%", borderRadius: "8px" }}
          >
            <source src={selectedVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;