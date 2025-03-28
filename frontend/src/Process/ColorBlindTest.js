import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navigation/Navbar";
import { Box, Typography, Button, TextField, Paper, Modal } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { CheckCircle, Visibility, NavigateNext, Send } from "@mui/icons-material";
import "react-toastify/dist/ReactToastify.css";
import "./ColorBlindTest.css";
import "./LoginModal.css";

// Import only the 20 images (removed 39, 53, 59, 21, and 12 (2))
import img2 from "../assets/colorBlindImages/2 (2).png";
import img3 from "../assets/colorBlindImages/2 (3).png";
import img4 from "../assets/colorBlindImages/2 (4).png";
import img5 from "../assets/colorBlindImages/2 (5).png";
import img6 from "../assets/colorBlindImages/2 (6).png";
import img8 from "../assets/colorBlindImages/5 (2).png";
import img9 from "../assets/colorBlindImages/5.png";
import img11 from "../assets/colorBlindImages/7 (2).png";
import img12 from "../assets/colorBlindImages/7 (3).png";
import img13 from "../assets/colorBlindImages/7.png";
import img14 from "../assets/colorBlindImages/8.png";
import img16 from "../assets/colorBlindImages/10.png";
import img18 from "../assets/colorBlindImages/12.png";
import img19 from "../assets/colorBlindImages/14.png";
import img20 from "../assets/colorBlindImages/16.png";
import img24 from "../assets/colorBlindImages/26.png";
import img26 from "../assets/colorBlindImages/27.png";
import img27 from "../assets/colorBlindImages/29.png";
import img35 from "../assets/colorBlindImages/56.png";
import img36 from "../assets/colorBlindImages/57.png";

// Images array (20 images)
const images = [
  img2, img3, img4, img5, img6, img8, img9, img11, img12, img13,
  img14, img16, img18, img19, img20, img24, img26, img27, img35, img36
];

// Shuffle function using Fisher-Yates algorithm
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const ColorBlindTest = () => {
  const [answers, setAnswers] = useState(Array(20).fill("")); // 20 answers now
  const [result, setResult] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [previousResult, setPreviousResult] = useState(null);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [shuffledImages, setShuffledImages] = useState([]);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(true);

  const isLoggedIn = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
    } else {
      fetchPreviousResult();
    }

    setShuffledImages(shuffleArray([...images]));
  }, [isLoggedIn, navigate, userId]);

  const fetchPreviousResult = async () => {
    try {
      const response = await fetch(`http://localhost:5001/color-blindness/color-blindness-test/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setPreviousResult(data.result);
        setCorrectCount(data.correctCount || 0);
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

    const userAnswers = shuffledImages.map((image, index) => {
      const imageName = image.split("/").pop();
      const normalizedImageName = imageName.replace(/\.[a-f0-9]+\.png$/, ".png");
      return { imageName: normalizedImageName, userAnswer: answers[index] };
    });

    try {
      const pythonResponse = await fetch("http://127.0.0.1:5000/color-blindness-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: userAnswers }),
      });

      const pythonData = await pythonResponse.json();

      if (pythonResponse.ok) {
        setResult(pythonData.result);
        setCorrectCount(pythonData.correctCount);
        setOpenModal(true);
        toast.success("Test result received successfully!");

        const nodeResponse = await fetch("http://localhost:5001/color-blindness/color-blindness-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, result: pythonData.result, correctCount: pythonData.correctCount }),
        });

        const nodeData = await nodeResponse.json();

        if (nodeResponse.ok) {
          toast.success("Test result saved to database!");
          fetchPreviousResult();
        } else {
          toast.error(`Error: ${nodeData.error}`);
        }

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
        setPreviousResult(null);
        setCorrectCount(0);
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

  const handleCloseInstructions = () => {
    setIsInstructionsOpen(false);
  };

  const imagesPerPage = 4;
  const startIndex = currentPage * imagesPerPage;
  const endIndex = startIndex + imagesPerPage;
  const currentImages = shuffledImages.slice(startIndex, endIndex);

  const handleNext = () => {
    if (endIndex < shuffledImages.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
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
          gap: "2rem",
          padding: { xs: "2rem 1rem", sm: "3rem 2rem", md: "4rem 4rem" },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
            width: "100%",
          }}
        >
          {currentImages.map((image, index) => {
            const globalIndex = startIndex + index;
            return (
              <Paper
                key={globalIndex}
                elevation={6}
                sx={{
                  padding: "2rem",
                  borderRadius: "15px",
                  backgroundColor: "#fff",
                  textAlign: "center",
                  width: "300px",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <img
                  src={image}
                  alt={`Test Image ${globalIndex + 1}`}
                  style={{
                    width: "100%",
                    borderRadius: "12px",
                    marginBottom: "1.5rem",
                  }}
                />
                <TextField
                  fullWidth
                  label={`Image ${globalIndex + 1} Answer`}
                  variant="outlined"
                  value={answers[globalIndex]}
                  onChange={(e) => handleAnswerChange(globalIndex, e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      fontSize: "1.2rem",
                    },
                  }}
                />
              </Paper>
            );
          })}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            sx={{
              backgroundColor: "#2a2250",
              "&:hover": { backgroundColor: "#1e1a3d" },
              padding: "0.8rem 2rem",
              borderRadius: "10px",
              fontSize: "1rem",
              textTransform: "none",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={endIndex >= shuffledImages.length}
            sx={{
              backgroundColor: "#2a2250",
              "&:hover": { backgroundColor: "#1e1a3d" },
              padding: "0.8rem 2rem",
              borderRadius: "10px",
              fontSize: "1rem",
              textTransform: "none",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            Next
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#2a2250",
              "&:hover": { backgroundColor: "#1e1a3d" },
              padding: "0.8rem 2rem",
              borderRadius: "10px",
              fontSize: "1rem",
              textTransform: "none",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            Submit
          </Button>
        </Box>

        {previousResult && (
          <Box
            sx={{
              backgroundColor: "#f5f5f5",
              padding: "2rem",
              borderRadius: "15px",
              textAlign: "center",
              width: "100%",
              maxWidth: "600px",
              mt: 3,
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#2a2250",
                fontWeight: "bold",
                marginBottom: "1.5rem",
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              Previous Test Result
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#555",
                fontSize: "1.1rem",
                marginBottom: "1rem",
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              {previousResult}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#555",
                fontSize: "1.1rem",
                marginBottom: "1.5rem",
                fontFamily: "'Open Sans', sans-serif",
              }}
            >
              Correct Answers: {correctCount} / {images.length}
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteResult}
              sx={{
                mt: 2,
                backgroundColor: "#ff4444",
                "&:hover": { backgroundColor: "#cc0000" },
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              Delete Previous Result
            </Button>
          </Box>
        )}
      </Box>

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
          <Typography sx={{ mt: 2, color: "#555", fontSize: "1.1rem" }}>
            Correct Answers: {correctCount} / {images.length}
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

      <Modal
        open={isInstructionsOpen}
        onClose={handleCloseInstructions}
        aria-labelledby="instructions-modal-title"
        aria-describedby="instructions-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 450,
            bgcolor: "background.paper",
            background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
            boxShadow: 24,
            p: 4,
            borderRadius: "15px",
            textAlign: "center",
            border: "2px solid #2a2250",
            animation: "fadeIn 0.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0, transform: "translate(-50%, -60%)" },
              "100%": { opacity: 1, transform: "translate(-50%, -50%)" },
            },
          }}
        >
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
              <Visibility sx={{ color: "#2a2250", fontSize: "1.5rem" }} />
              <span>Look at each image carefully.</span>
            </div>
            <div className="instruction-item">
              <CheckCircle sx={{ color: "#2a2250", fontSize: "1.5rem" }} />
              <span>Enter the number or shape you see in the image.</span>
            </div>
            <div className="instruction-item">
              <NavigateNext sx={{ color: "#2a2250", fontSize: "1.5rem" }} />
              <span>Navigate through the images using the "Previous" and "Next" buttons.</span>
            </div>
            <div className="instruction-item">
              <Send sx={{ color: "#2a2250", fontSize: "1.5rem" }} />
              <span>Once all answers are filled, click "Submit" to get your result.</span>
            </div>
          </Box>

          <Button
            onClick={handleCloseInstructions}
            variant="contained"
            sx={{
              mt: 3,
              background: "linear-gradient(135deg, #2a2250, #1e1a3d)",
              color: "#fff",
              padding: "0.8rem 2rem",
              borderRadius: "10px",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: "bold",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.2)",
                background: "linear-gradient(135deg, #1e1a3d, #2a2250)",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Modal>

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