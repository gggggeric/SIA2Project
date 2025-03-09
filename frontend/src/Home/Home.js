import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import Navbar from "../Navigation/Navbar";
import opticImage from "../assets/isometricImage.png";

const HomePage = () => {
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
            }}
          >
            Empowering Vision, Enhancing Care
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "#555",
              marginBottom: "2rem",
              lineHeight: 1.5,
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
    </Box>
  );
};

export default HomePage;
