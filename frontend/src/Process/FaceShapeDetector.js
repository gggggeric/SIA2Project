import React, { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import Navbar from "../Navigation/Navbar";
import "./FaceShapeDetector.css";

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
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      context.restore();

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
      const response = await fetch("http://localhost:5000/predict-face-shape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || "Failed to detect face shape.");
      }
    } catch (err) {
      setError("Server error. Please try again.");
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

          {error && <p className="face-shape-error-message">{error}</p>}
        </div>
      </div>

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
