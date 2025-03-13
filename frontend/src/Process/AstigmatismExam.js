import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Navbar from "../Navigation/Navbar";
import { Box, Typography, Button, Paper, TextField } from "@mui/material";
import astigmatismImage from "../assets/astigTest.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AstigmatismExam.css"; // Import CSS for the modal
import "./LoginModal.css"; // Import the CSS file
const AstigmatismTest = () => {
  const [lines, setLines] = useState("");
  const [result, setResult] = useState("");
  const [previousResult, setPreviousResult] = useState(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const isLoggedIn = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate(); // Initialize useNavigate

  // Check if the user is logged in when the component mounts
  useEffect(() => {
    if (!isLoggedIn) {
      // Show the login prompt modal if the user is not logged in
      setIsLoginPromptOpen(true);
    } else {
      // Fetch the user's previous result if logged in
      fetchPreviousResult();
    }
  }, [isLoggedIn, navigate, userId]);

  const fetchPreviousResult = async () => {
    try {
      const response = await fetch(`http://localhost:5001/astigmatism/astigmatism-test/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setPreviousResult(data.result);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching previous result:", error);
    }
  };

  const handleTest = async () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    if (!userId) {
      toast.error("User ID not found. Please log in again.");
      return;
    }

    if (!lines.trim()) {
      toast.error("Please provide detected bold lines (e.g., 1, 6).");
      return;
    }

    try {
      // Step 1: Send data to Python server for calculation
      const pythonResponse = await fetch("http://127.0.0.1:5000/astigmatism-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lines }),
      });

      const pythonData = await pythonResponse.json();

      if (pythonResponse.ok) {
        setResult(pythonData.result);

        // Step 2: Save the result to MongoDB via Node.js server
        const nodeResponse = await fetch("http://localhost:5001/astigmatism/astigmatism-test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            lines,
            result: pythonData.result,
          }),
        });

        const nodeData = await nodeResponse.json();

        if (nodeResponse.ok) {
          toast.success("Test result saved successfully!");
          fetchPreviousResult(); // Refresh the previous result
        } else {
          toast.error(`Error: ${nodeData.error}`);
        }
      } else {
        toast.error(`Error: ${pythonData.error}`);
      }
    } catch (error) {
      toast.error("Error connecting to the server. Please try again.");
    }
  };

  const handleDeleteResult = async () => {
    try {
      const response = await fetch(`http://localhost:5001/astigmatism/astigmatism-test/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setPreviousResult(null); // Clear the previous result
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deleting previous result.");
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          paddingTop: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: { xs: "4rem 1rem", sm: "5rem 2rem", md: "5rem 4rem" },
          flexDirection: { xs: "column-reverse", md: "row" },
          gap: { xs: "2rem", md: "4rem" },
        }}
      >
        {/* Left Side - Astigmatism Image */}
        <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, width: "100%", padding: { xs: "0 1rem", md: "0 2rem" } }}>
          <Paper elevation={12} sx={{ padding: "1.5rem", borderRadius: "20px", backgroundColor: "#fff", overflow: "hidden", position: "relative" }}>
            <img src={astigmatismImage} alt="Astigmatism Test Chart" style={{ width: "100%", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }} />
          </Paper>
        </Box>

        {/* Right Side - Input and Information */}
        <Box sx={{ maxWidth: { xs: "100%", md: "50%" }, textAlign: { xs: "center", md: "left" }, padding: { xs: "0 1rem", md: "0 2rem" } }}>
          <Typography variant="h3" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "1rem", fontFamily: "'Poppins', sans-serif" }}>
            Astigmatism Test
          </Typography>

          <TextField
            fullWidth
            label="Enter the bold lines (e.g., 1, 6)"
            variant="outlined"
            value={lines}
            onChange={(e) => setLines(e.target.value)}
            sx={{ marginBottom: "1rem" }}
          />

          <Button variant="contained" onClick={handleTest} sx={{ backgroundColor: "#2a2250", "&:hover": { backgroundColor: "#1e1a3d" }, padding: "0.8rem 2rem", borderRadius: "8px" }}>
            Submit
          </Button>

          {/* Display Previous Result */}
          {previousResult && (
            <Box sx={{ backgroundColor: "#f5f5f5", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
              <Typography variant="h6" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "0.5rem" }}>
                Previous Test Result:
              </Typography>
              <Typography variant="body1" sx={{ color: "#555" }}>
                {previousResult}
              </Typography>
              <Button variant="contained" onClick={handleDeleteResult} sx={{ backgroundColor: "#ff4444", "&:hover": { backgroundColor: "#cc0000" }, marginTop: "1rem" }}>
                Delete Previous Result
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Login Prompt Modal */}
      {isLoginPromptOpen && (
          <div className="optical-shops-login-modal-overlay">
            <div className="optical-shops-login-modal-content">
              <h2>Login Required</h2>
              <p>You need to login first to use this feature.</p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="optical-shops-login-close-button"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="colored" />
    </>
  );
};

export default AstigmatismTest;