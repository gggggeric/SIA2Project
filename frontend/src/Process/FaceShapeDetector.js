import React, { useState, useRef, useEffect } from "react";
import { FaCamera } from "react-icons/fa";
import Navbar from "../Navigation/Navbar";
import faceShapeGuide from "../assets/faceshape.png";
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
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);

  const glassesImages = {
    Oval: [squareGlasses, rectangleGlasses, circleGlasses],
    Round: [rectangleGlasses, squareGlasses, angularGlasses],
    Square: [circleGlasses, aviatorGlasses],
    Heart: [aviatorGlasses, circleGlasses],
    Oblong: [rectangleGlasses, circleGlasses],
  };

  const handleImageUpload = (event) => {
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

          {preview && (
            <div className="image-preview-container">
              <img src={preview} alt="Captured Preview" className="image-preview" />
            </div>
          )}

          <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />

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

          <button onClick={detectFaceShape} className="detect-button" disabled={loading}>
            {loading ? "Detecting..." : "Detect Face Shape"}
          </button>

          {error && <p className="error-message">{error}</p>}

          {result && (
            <button className="view-results-button" onClick={() => setIsModalOpen(true)}>
              View Results
            </button>
          )}
        </div>

        <img src={faceShapeGuide} alt="Face Shape Guide" className="face-shape-guide" />
      </div>

      {isModalOpen && result && (
  <div className="modal-overlay">
    <div className="modal-content">
      {/* Modal Header with Flexbox Fix */}
      <div className="modal-header">
        <h2>Face Shape Results</h2>
        <button className="close-modal-button" onClick={() => setIsModalOpen(false)}>✖</button>
      </div>

      <p><strong>Face Shape:</strong> {result.face_shape}</p>
      <p><strong>Recommended Glasses:</strong> {result.recommended_glasses}</p>

      <div className="glasses-container">
        {glassesImages[result.face_shape]?.map((glasses, index) => (
          <img key={index} src={glasses} alt={`${result.face_shape} Glasses`} className="glasses-recommendation" />
        ))}
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default FaceShapeDetector;
