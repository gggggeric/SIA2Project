import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navigation/Navbar";
import { Box, Typography, Button, Paper, TextField, Modal } from "@mui/material";
import { Visibility, CheckCircle, NavigateNext, Send, Replay } from "@mui/icons-material"; // Import icons
import astigmatismImage from "../assets/astigTest.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginModal.css";

const AstigmatismTest = () => {
  const [lines, setLines] = useState("");
  const [result, setResult] = useState("");
  const [previousResult, setPreviousResult] = useState(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isTestStarted, setIsTestStarted] = useState(false);
  const [isImageVisible, setIsImageVisible] = useState(false);
  const [isInstructionModalOpen, setIsInstructionModalOpen] = useState(true);
  const [countdown, setCountdown] = useState(20); // Countdown timer

  const isLoggedIn = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
    } else {
      fetchPreviousResult();
    }
  }, [isLoggedIn, navigate, userId]);

  // Countdown timer effect
  useEffect(() => {
    if (isImageVisible && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setIsImageVisible(false); // Hide image after countdown ends
    }
  }, [isImageVisible, countdown]);

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
          fetchPreviousResult();
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
        setPreviousResult(null);
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Error deleting previous result.");
    }
  };

  const startTest = () => {
    setIsInstructionModalOpen(false);
    setIsTestStarted(true);
    setIsImageVisible(true);
    setCountdown(20); // Reset countdown
  };

  const repeatTest = () => {
    setIsImageVisible(true);
    setCountdown(20); // Reset countdown
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          paddingTop: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: { xs: "4rem 1rem", sm: "5rem 2rem", md: "5rem 4rem" },
          flexDirection: { xs: "column", md: "row" },
          gap: { xs: "2rem", md: "4rem" },
        }}
      >
        {/* Image Modal */}
        {isImageVisible && (
          <Modal open={isImageVisible} onClose={() => setIsImageVisible(false)}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: { xs: "90%", sm: "80%", md: "60%" },
                bgcolor: "background.paper",
                boxShadow: 24,
                p: 4,
                borderRadius: "20px",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#2a2250" }}>
                Stare at the <strong>center</strong> of the image for {countdown} seconds
              </Typography>
              <img
                src={astigmatismImage}
                alt="Astigmatism Test Chart"
                style={{ width: "100%", borderRadius: "10px", maxHeight: "70vh", objectFit: "contain" }}
              />
            </Box>
          </Modal>
        )}

        {/* Test Box (Right Side) */}
        {isTestStarted && !isImageVisible && (
          <Box
            sx={{
              maxWidth: { xs: "100%", md: "50%" },
              width: "100%",
              textAlign: "center",
              padding: { xs: "0 1rem", md: "0 2rem" },
            }}
          >
            <Paper
              elevation={3}
              sx={{
                padding: "2rem",
                borderRadius: "10px",
                backgroundColor: "#fff",
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h4" sx={{ color: "#2a2250", fontWeight: "bold", mb: 3, fontFamily: "'Poppins', sans-serif" }}>
                Enter the Bold Lines You Saw
              </Typography>
              <TextField
                fullWidth
                label="Enter the bold lines (e.g., 1, 6)"
                variant="outlined"
                value={lines}
                onChange={(e) => setLines(e.target.value)}
                sx={{ marginBottom: "1.5rem" }}
              />
              <Button
                variant="contained"
                onClick={handleTest}
                sx={{
                  backgroundColor: "#2a2250",
                  "&:hover": { backgroundColor: "#1e1a3d" },
                  padding: "0.8rem 2rem",
                  borderRadius: "8px",
                  mr: 2,
                }}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                onClick={repeatTest}
                startIcon={<Replay />}
                sx={{
                  color: "#2a2250",
                  borderColor: "#2a2250",
                  "&:hover": { borderColor: "#1e1a3d", backgroundColor: "rgba(42, 34, 80, 0.1)" },
                  padding: "0.8rem 2rem",
                  borderRadius: "8px",
                }}
              >
                Repeat Test
              </Button>
            </Paper>

            {/* Previous Result Section */}
            {previousResult && (
              <Paper
                elevation={3}
                sx={{
                  backgroundColor: "#f5f5f5",
                  padding: "1.5rem",
                  borderRadius: "10px",
                  marginTop: "2rem",
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Typography variant="h6" sx={{ color: "#2a2250", fontWeight: "bold", marginBottom: "0.5rem" }}>
                  Previous Test Result:
                </Typography>
                <Typography variant="body1" sx={{ color: "#555" }}>
                  {previousResult}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleDeleteResult}
                  sx={{
                    backgroundColor: "#ff4444",
                    "&:hover": { backgroundColor: "#cc0000" },
                    marginTop: "1rem",
                  }}
                >
                  Delete Previous Result
                </Button>
              </Paper>
            )}
          </Box>
        )}
      </Box>

      {/* Instruction Modal */}
      <Modal open={isInstructionModalOpen} onClose={() => setIsInstructionModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "70%", md: "50%" },
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "10px",
            textAlign: "center",
          }}
        >
          {/* Title */}
          <Typography
            id="instructions-modal-title"
            variant="h5"
            component="h2"
            sx={{
              color: "#2a2250",
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              mb: 3,
              textTransform: "uppercase",
            }}
          >
            Test Instructions
          </Typography>

          {/* Instructions List */}
          <Box
            sx={{
              textAlign: "left",
              "& .instruction-item": {
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                mb: 2,
                color: "#555",
                fontSize: "1.1rem",
                fontFamily: "'Open Sans', sans-serif",
              },
            }}
          >
            <div className="instruction-item">
              <Visibility sx={{ color: "#2a2250", fontSize: "1.5rem" }} /> {/* Icon */}
              <span>Stare at the <strong>center</strong> of the image for 20 seconds.</span>
            </div>
            <div className="instruction-item">
              <CheckCircle sx={{ color: "#2a2250", fontSize: "1.5rem" }} /> {/* Icon */}
              <span>Note the bold lines you see in the image.</span>
            </div>
            <div className="instruction-item">
              <NavigateNext sx={{ color: "#2a2250", fontSize: "1.5rem" }} /> {/* Icon */}
              <span>After the image disappears, enter the numbers of the bold lines (e.g., "1, 6").</span>
            </div>
            <div className="instruction-item">
              <Send sx={{ color: "#2a2250", fontSize: "1.5rem" }} /> {/* Icon */}
              <span>Click "Submit" to get your result.</span>
            </div>
          </Box>

          {/* Start Test Button */}
          <Button
            variant="contained"
            onClick={startTest}
            sx={{
              backgroundColor: "#2a2250",
              "&:hover": { backgroundColor: "#1e1a3d" },
              padding: "0.8rem 2rem",
              borderRadius: "8px",
              mt: 3,
            }}
          >
            Start Test
          </Button>
        </Box>
      </Modal>

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