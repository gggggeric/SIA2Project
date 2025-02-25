import React, { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa"; // Import camera icon
import Navbar from "../Navigation/Navbar";
import faceShapeGuide from "../assets/faceshape.png"; // Import image
import "./FaceShapeDetector.css"; // Import CSS file

const FaceShapeDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result.split(",")[1]); // Extract base64 string
        setPreview(reader.result); // Set preview image
      };
      reader.readAsDataURL(file);
    }
  };

  // Start the webcam
  const startCamera = () => {
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

  // Capture image from webcam
  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
  
    if (video && canvas) {
      context.save(); // Save current state
      context.scale(-1, 1); // Flip horizontally
      context.drawImage(video, -canvas.width, 0, canvas.width, canvas.height); // Draw flipped image
      context.restore(); // Restore state
  
      const dataUrl = canvas.toDataURL("image/jpeg");
      setImage(dataUrl.split(",")[1]); // Extract base64 string
      setPreview(dataUrl);
  
      // Stop the camera after capturing
      if (video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
      }
      setIsCameraOn(false);
    }
  };
  
  // Stop the camera when unmounting
  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Send image to backend
  const detectFaceShape = async () => {
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
    <div className="container">
      <Navbar />
      <div className="border-box">
        <div className="group-box">
          <h2 className="title">Best Glasses for Face Shape</h2>

          {/* Image Preview */}
          {preview && (
            <div className="image-preview-container">
              <img src={preview} alt="Captured Preview" className="image-preview" />
            </div>
          )}

          {/* File Upload */}
          <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />

          {/* Camera Capture */}
          {isCameraOn ? (
            <div className="camera-container">
              <video ref={videoRef} autoPlay className="webcam"></video>
              <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }}></canvas>
              <button onClick={captureImage} className="capture-button">Capture Image</button>
            </div>
          ) : (
            <button onClick={startCamera} className="camera-button">
              <FaCamera className="camera-icon" /> Use Camera
            </button>
          )}

          {/* Detect Face Shape Button */}
          <button onClick={detectFaceShape} className="detect-button" disabled={loading}>
            {loading ? "Detecting..." : "Detect Face Shape"}
          </button>

          {/* Error Message */}
          {error && <p className="error-message">{error}</p>}

          {/* Results */}
          {result && (
            <div className="result-box">
              <p><strong>Face Shape:</strong> {result.face_shape}</p>
              <p><strong>Recommended Glasses:</strong> {result.recommended_glasses}</p>
            </div>
          )}
        </div>

        {/* Face Shape Guide Image */}
        <img src={faceShapeGuide} alt="Face Shape Guide" className="face-shape-guide" />
      </div>
    </div>
  );
};

export default FaceShapeDetector;
