import React, { useState } from "react";
import Navbar from "../Navigation/Navbar";
import {
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Modal,
  Box,
  Button,
} from "@mui/material";
import { Close } from "@mui/icons-material";

// Import team images
import gianan from "../assets/developers/mico.jpg";
import morit from "../assets/developers/morit1.jpg";
import bacala from "../assets/developers/nicole.JPG";
import gone from "../assets/developers/krizel.jpg";

// Import static images for Mission and Vision
import missionImage from "../assets/mission.png"; // Replace with your image path
import visionImage from "../assets/vision.png"; // Replace with your image path

// Import GIF for What Our System Does
import systemGif from "../assets/GIF/gif.gif"; // Replace with your GIF path

const teamMembers = [
  {
    name: "Geric",
    role: "Lead Developer",
    image: morit,
    description:
      "Geric is responsible for both frontend and backend development, ensuring seamless integration.",
    email: "gericmorit3211@gmail.com",
  },
  {
    name: "Mico",
    role: "Backend Developer",
    image: gianan,
    description:
      "Mico specializes in backend development, working on APIs and database management.",
    email: "micogianan28@gmail.com",
  },
  {
    name: "Nicole",
    role: "Frontend Developer",
    image: bacala,
    description:
      "Nicole focuses on frontend design and implementation to enhance user experience.",
    email: "Nicolebacala17@gmail.com",
  },
  {
    name: "Krizel",
    role: "UI/UX Designer",
    image: gone,
    description:
      "Krizel creates intuitive UI/UX designs to make Optic AI visually appealing and user-friendly.",
    email: "krizelannegone08@gmail.com",
  },
];

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);

  const openModal = (member) => {
    setSelectedMember(member);
  };

  const closeModal = () => {
    setSelectedMember(null);
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
      <Navbar />

      {/* About Us Section */}
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          margin: "24px 0",
          borderRadius: 4,
          backgroundColor: "#f5f5f5",
          textAlign: "center",
        }}
      >
        <Typography variant="h3" gutterBottom>
          About Us
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to <strong>Optic AI</strong>! Our system is designed to
          revolutionize optical care by integrating AI-powered solutions to
          enhance user experience and provide better vision-related services.
        </Typography>
      </Paper>

      {/* Mission, Vision & System Features Section */}
      <Grid container spacing={3} sx={{ marginBottom: 4 }}>
        {[
          {
            title: "Our Mission",
            content:
              "To provide an AI-powered system that enhances optical care by offering accurate eye-grade predictions, personalized frame suggestions, and accessible optical shop locations.",
            image: missionImage, // Static image for Mission
          },
          {
            title: "Our Vision",
            content:
              "To become the leading AI-driven optical care platform that empowers individuals to achieve better vision with personalized solutions and advanced technology.",
            image: visionImage, // Static image for Vision
          },
          {
            title: "What Our System Does",
            content: (
              <ul style={{ textAlign: "left", paddingLeft: 16 }}>
                <li>
                  <strong>Eye Grade Prediction:</strong> Uses AI to analyze and
                  predict the grade of your eyes.
                </li>
                <li>
                  <strong>Face Shape Analysis:</strong> Identifies your face
                  shape to suggest the best glasses frame.
                </li>
                <li>
                  <strong>Optical Shop Locator:</strong> Helps you find nearby
                  optical shops within a 5km radius.
                </li>
              </ul>
            ),
            gif: systemGif, // GIF for What Our System Does
          },
        ].map((item, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Paper
              elevation={3}
              sx={{
                padding: 3,
                borderRadius: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: 6,
                },
              }}
            >
              {/* Use image or GIF based on the section */}
              {item.image ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={item.image} // Static image
                  alt={item.title}
                  sx={{ borderRadius: 4, marginBottom: 2 }}
                />
              ) : (
                <CardMedia
                  component="img"
                  height="140"
                  image={item.gif} // GIF
                  alt={item.title}
                  sx={{ borderRadius: 4, marginBottom: 2 }}
                />
              )}
              <Typography variant="h5" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body1">{item.content}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Team Section */}
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          margin: "24px 0",
          borderRadius: 4,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="h3" gutterBottom align="center">
          Meet Our Team
        </Typography>
        <Grid container spacing={3}>
          {teamMembers.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 4,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-10px)",
                    boxShadow: 6,
                  },
                }}
                onClick={() => openModal(member)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={member.image}
                  alt={member.name}
                  sx={{ borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                />
                <CardContent>
                  <Typography variant="h6" align="center">
                    {member.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {member.role}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Modal */}
      <Modal open={Boolean(selectedMember)} onClose={closeModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            borderRadius: 4,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={closeModal}>
              <Close />
            </Button>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <img
              src={selectedMember?.image}
              alt={selectedMember?.name}
              style={{ width: 100, height: 100, borderRadius: "50%" }}
            />
            <Typography variant="h5">{selectedMember?.name}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {selectedMember?.role}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              {selectedMember?.description}
            </Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>Email:</strong>{" "}
              <a href={`mailto:${selectedMember?.email}`}>
                {selectedMember?.email}
              </a>
            </Typography>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default About;