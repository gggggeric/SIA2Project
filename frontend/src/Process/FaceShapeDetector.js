import React, { useState } from "react";
import Navbar from "../Navigation/Navbar";
import faceShapeGuide from "../assets/faceshape.png"; // Import image
import "./FaceShapeDetector.css"; // Import CSS file

const FaceShapeDetector = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert image to base64 and create preview
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

  // Send image to backend
  const detectFaceShape = async () => {
    if (!image) {
      setError("Please upload an image.");
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
        {/* Group Box */}
        <div className="group-box">
          <h2 className="title">Best Glasses for Face Shape</h2>

          {/* Image Upload */}
          <label className="file-label">Upload an image:</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="file-input"
          />

          {/* Image Preview */}
          <div className="image-preview-container">
            {preview && <img src={preview} alt="Uploaded Preview" className="image-preview" />}
          </div>

          {/* Detect Button */}
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
