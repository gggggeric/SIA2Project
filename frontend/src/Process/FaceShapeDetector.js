import React, { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import Navbar from "../Navigation/Navbar";
import "./FaceShapeDetector.css";
import "./LoginModal.css"; // Import the CSS file
// Import glasses images
import angularGlasses from "../assets/glassesImages/angular.png";
import aviatorGlasses from "../assets/glassesImages/aviator.png";
import squareGlasses from "../assets/glassesImages/square.png";
import rectangleGlasses from "../assets/glassesImages/rectangular.png";
import circleGlasses from "../assets/glassesImages/circle.png";

const FaceShapeDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false); // State for login modal
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const isLoggedIn = localStorage.getItem("token"); // Check if user is logged in

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true); // Show floating login prompt if not logged in
    }
  }, [isLoggedIn]);

  const glassesImages = {
    Oval: [squareGlasses, rectangleGlasses, circleGlasses],
    Round: [rectangleGlasses, squareGlasses, angularGlasses],
    Square: [circleGlasses, aviatorGlasses],
    Heart: [aviatorGlasses, circleGlasses],
    Oblong: [rectangleGlasses, circleGlasses],
  };

  const handleImageUpload = (event) => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result.split(",")[1]);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    setIsCameraOn(true);
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        setError("Camera access denied.");
      });
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (video && canvas) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImage(dataUrl.split(",")[1]);
      setPreview(dataUrl);

      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      setIsCameraOn(false);
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const detectFaceShape = async () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
  
    if (!image) {
      setError("Please upload or capture an image.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      // Step 1: Send image to Python server for face shape prediction
      const predictionResponse = await fetch("http://localhost:5000/predict-face-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });
  
      const predictionData = await predictionResponse.json();
      if (!predictionResponse.ok) {
        throw new Error(predictionData.error || "Failed to detect face shape.");
      }
  
      // Step 2: Save the result to the Node.js backend
      const userId = localStorage.getItem("userId"); // Get the logged-in user's ID
      const saveResponse = await fetch("http://localhost:5001/face-shape/save-face-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          faceShape: predictionData.face_shape,
          recommendedGlasses: predictionData.recommended_glasses,
        }),
      });
  
      const saveData = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(saveData.error || "Failed to save face shape.");
      }
  
      // Step 3: Update the state with the prediction result
      setResult(predictionData);
    } catch (err) {
      setError(err.message || "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="face-shape-container">
      <Navbar />
      <div className="face-shape-border-box">
        <div className="face-shape-group-box">
          <h2 className="face-shape-title">Best Glasses for Face Shape</h2>

          {preview && (
            <div className="face-shape-image-preview-container">
              <img src={preview} alt="Captured Preview" className="face-shape-image-preview" />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="face-shape-file-input"
          />

          {isCameraOn ? (
            <div className="face-shape-camera-container">
              <video ref={videoRef} autoPlay className="face-shape-webcam"></video>
              <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }}></canvas>
              <button onClick={captureImage} className="face-shape-capture-button">
                Capture Image
              </button>
            </div>
          ) : (
            <button onClick={startCamera} className="face-shape-camera-button">
              <FaCamera className="face-shape-camera-icon" /> Use Camera
            </button>
          )}

          <button
            onClick={detectFaceShape}
            className="face-shape-detect-button"
            disabled={loading}
          >
            {loading ? "Detecting..." : "Detect Face Shape"}
          </button>

          {result && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="face-shape-view-results-button"
            >
              View Result
            </button>
          )}

          {error && <p className="face-shape-error-message">{error}</p>}
        </div>
      </div>

      {/* Results Modal */}
      {isModalOpen && result && (
        <div className="face-shape-modal-overlay">
          <div className="face-shape-modal-content">
            <div className="face-shape-modal-header">
              <h2>Face Shape Detected</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="face-shape-close-modal-button"
              >
                &times;
              </button>
            </div>
            <p>
              Your face shape is: <strong>{result.face_shape}</strong> (Confidence:{" "}
              <strong>{result.confidence}</strong>)
            </p>
            <p>Recommended Glasses: {result.recommended_glasses}</p>
            <div className="face-shape-glasses-container">
              {glassesImages[result.face_shape]?.map((glasses, index) => (
                <img
                  key={index}
                  src={glasses}
                  alt={`Glasses ${index + 1}`}
                  className="face-shape-glasses-recommendation"
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Centered Login Prompt Modal */}
      {isLoginPromptOpen && (
        <div className="face-shape-login-modal-overlay">
          <div className="face-shape-login-modal-content">
            <h2>Login Required</h2>
            <p>You need to login first to use this feature.</p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="face-shape-login-close-button"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaceShapeDetector;