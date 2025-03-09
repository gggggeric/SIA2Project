import React, { useState } from "react";
import { Box, Typography, Button, Paper, Modal } from "@mui/material";
import Navbar from "../Navigation/Navbar";
import opticImage from "../assets/isometricImage.png";
import video1 from '../assets/video2.mp4'; // Import video files
import video2 from '../assets/video1.mp4';
import video3 from '../assets/video3.mp4';
const HomePage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Handle opening the modal
  const handleOpen = (videoSrc) => {
    setSelectedVideo(videoSrc);
    setModalOpen(true);
  };

  // Handle closing the modal
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
          flexDirection: { xs: "column-reverse", md: "row" }, // Image on the right
          gap: { xs: "2rem", md: "0" },
        }}
      >
        {/* Left Side Content */}
        <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, textAlign: { xs: "center", md: "left" } }}>
          <Typography
            variant="h3"
            sx={{
              color: "#2a2250", // Theme color
              fontWeight: "bold",
              marginBottom: "1rem",
              fontFamily: "'Poppins', sans-serif", // Modern font
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
              fontFamily: "'Poppins', sans-serif", // Modern font
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
              fontFamily: "'Open Sans', sans-serif", // Clean font
            }}
          >
            Use smart intelligent systems to assist your waste disposal practices for a sustainable future.
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#2a2250", // Theme color
              "&:hover": { backgroundColor: "#1e1a3d" },
              padding: "0.8rem 2rem",
              borderRadius: "8px",
              fontFamily: "'Poppins', sans-serif", // Modern font
              fontSize: "1rem",
              textTransform: "none", // Remove uppercase
              boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
              },
            }}
          >
            Get Started
          </Button>
        </Box>

        {/* Right Side Image */}
        <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, width: "100%" }}>
          <Paper
            elevation={12}
            sx={{
              padding: "1.5rem",
              borderRadius: "20px",
              backgroundColor: "#fff",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)", // Added shadow for depth
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 15px 40px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
              },
            }}
          >
            <img
              src={opticImage}
              alt="Optic AI Illustration"
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
                backgroundColor: "#2a2250", // Theme color
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
            fontFamily: "'Poppins', sans-serif", // Modern font
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
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)", // Added shadow for depth
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
              },
            }}
          >
            <Typography variant="h5" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1.5rem", fontFamily: "'Poppins', sans-serif" }}>
              Analyze Face Shape
            </Typography>
            <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}>
              Our system uses advanced facial recognition technology to analyze your face shape and recommend the perfect eyeglass frame that complements your features. Whether you have a round, oval, or square face, we’ve got you covered!
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
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)", // Added shadow for depth
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
              },
            }}
          >
            <Typography variant="h5" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1.5rem", fontFamily: "'Poppins', sans-serif" }}>
              Predict Eye Grade
            </Typography>
            <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}>
              Using cutting-edge AI algorithms, our system predicts your eye grade prescription with high accuracy. Simply input your data, and we’ll provide you with a reliable estimate to help you make informed decisions about your vision care.
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
              boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)", // Added shadow for depth
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
              },
            }}
          >
            <Typography variant="h5" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1.5rem", fontFamily: "'Poppins', sans-serif" }}>
              Locate Optical Shops
            </Typography>
            <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6, fontFamily: "'Open Sans', sans-serif" }}>
              Need to find an optical shop nearby? Our system locates all optical shops within a 5KM radius, complete with directions and contact information. Never struggle to find the right place for your eyewear needs again!
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
            fontFamily: "'Poppins', sans-serif", // Modern font
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
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
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
                <source src={video1} type="video/mp4" /> {/* Use imported video */}
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
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
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
                <source src={video2} type="video/mp4" /> {/* Use imported video */}
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
                boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.2)", // Enhanced shadow on hover
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
                <source src={video3} type="video/mp4" /> {/* Use imported video */}
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