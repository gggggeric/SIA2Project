import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Navbar from "../Navigation/Navbar";
import { Box, Typography, Button, TextField, Paper, Modal } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ColorBlindTest.css"; // Import CSS for the modal
import "./LoginModal.css"; // Import the CSS file
import img1 from "../assets/colorBlindImages/img1.png";
import img2 from "../assets/colorBlindImages/img2.png";
import img3 from "../assets/colorBlindImages/img3.png";

const ColorBlindTest = () => {
  const [answers, setAnswers] = useState(["", "", ""]);
  const [result, setResult] = useState("");
  const [openModal, setOpenModal] = useState(false);
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
      const response = await fetch(`http://localhost:5001/color-blindness/color-blindness-test/${userId}`);
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

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index] = value;
    setAnswers(updatedAnswers);
  };

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    if (answers.some((answer) => !answer.trim())) {
      toast.error("Please fill in all the answers.");
      return;
    }

    try {
      // Step 1: Send answers to Python backend for processing
      const pythonResponse = await fetch("http://127.0.0.1:5000/color-blindness-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const pythonData = await pythonResponse.json();

      if (pythonResponse.ok) {
        setResult(pythonData.result);
        setOpenModal(true); // Open the modal
        toast.success("Test result received successfully!");

        // Step 2: Save the result to Node.js backend (MongoDB)
        const nodeResponse = await fetch("http://localhost:5001/color-blindness/color-blindness-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, result: pythonData.result }),
        });

        const nodeData = await nodeResponse.json();

        if (nodeResponse.ok) {
          toast.success("Test result saved to database!");
          fetchPreviousResult(); // Refresh the previous result
        } else {
          toast.error(`Error: ${nodeData.error}`);
        }

        // Save the result to localStorage
        localStorage.setItem("colorBlindTestResult", pythonData.result);
      } else {
        toast.error(`Error: ${pythonData.error}`);
      }
    } catch (error) {
      toast.error("Error connecting to the server. Please try again.");
    }
  };

  const handleDeleteResult = async () => {
    try {
      const response = await fetch(`http://localhost:5001/color-blindness/color-blindness-test/${userId}`, {
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

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          paddingTop: "80px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "3rem",
          padding: "3rem",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: "#2a2250",
            fontWeight: "bold",
            textAlign: "center",
            fontSize: { xs: "2rem", sm: "3rem" },
          }}
        >
          Color Blindness Test
        </Typography>

        {/* Image Display Section */}
        <Box
          sx={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[img1, img2, img3].map((image, index) => (
            <Paper
              key={index}
              elevation={6}
              sx={{
                padding: "2rem",
                borderRadius: "15px",
                backgroundColor: "#fff",
                textAlign: "center",
                width: "300px",
              }}
            >
              <img
                src={image}
                alt={`Test Image ${index + 1}`}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                }}
              />
              <TextField
                fullWidth
                label={`Image ${index + 1} Answer`}
                variant="outlined"
                value={answers[index]}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontSize: "1.2rem",
                  },
                }}
              />
            </Paper>
          ))}
        </Box>

        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#2a2250",
            "&:hover": { backgroundColor: "#1e1a3d" },
            padding: "1rem 3rem",
            borderRadius: "10px",
            fontSize: "1.2rem",
            textTransform: "none",
          }}
        >
          Submit
        </Button>

        {/* Display Previous Result */}
        {previousResult && (
          <Paper
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "1.5rem",
              borderRadius: "12px",
              textAlign: "center",
              width: "100%",
              maxWidth: "600px",
              mt: 3,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              Previous Test Result:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#555",
                fontSize: "1.1rem",
              }}
            >
              {previousResult}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteResult}
              sx={{ mt: 2 }}
            >
              Delete Previous Result
            </Button>
          </Paper>
        )}
      </Box>

      {/* Modal for Result */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <Typography id="modal-title" variant="h6" component="h2" sx={{ color: "#2a2250", fontWeight: "bold" }}>
            Test Result
          </Typography>
          <Typography id="modal-description" sx={{ mt: 2, color: "#555", fontSize: "1.1rem" }}>
            {result}
          </Typography>
          <Button
            onClick={handleCloseModal}
            variant="contained"
            sx={{
              mt: 3,
              backgroundColor: "#2a2250",
              "&:hover": { backgroundColor: "#1e1a3d" },
              borderRadius: "10px",
              textTransform: "none",
            }}
          >
            Close
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

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </>
  );
};

export default ColorBlindTest;