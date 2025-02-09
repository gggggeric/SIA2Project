import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Navigation/Navbar";
import axios from "axios";
import styles from "./BothEye.module.css"; // Importing CSS Module
import eyeTestImage from "../assets/eyetest1.png"; // Importing eye test image

const BothEyePage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eyeStatus, setEyeStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [detectedSpeech, setDetectedSpeech] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Function to capture webcam image and convert to Base64
  const captureImage = async () => {
    if (webcamRef.current) {
      const video = webcamRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      setImage(canvas.toDataURL("image/jpeg"));
    }
  };

  // Function to calculate face distance and detect eye status
  const calculateFaceDistance = async () => {
    if (image) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/calculate-distance", {
          image: image.split(",")[1], // Send base64 image data
        });

        if (response.data.error) {
          setErrorMessage(response.data.error);
          setDistance(null);
          setEyeStatus(null);
        } else {
          setDistance(response.data.distance_cm);
          setEyeStatus(response.data.eye_status);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error("Error calculating distance:", error);
        setErrorMessage("An error occurred while processing the image.");
        setDistance(null);
        setEyeStatus(null);
      }
    }
  };

  // Capture image every 5 seconds and analyze it
  useEffect(() => {
    const interval = setInterval(() => {
      captureImage();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Process the captured image
  useEffect(() => {
    if (image) {
      calculateFaceDistance();
    }
  }, [image]);

  // Start webcam stream
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        webcamRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setErrorMessage("Unable to access the webcam.");
      }
    };
    startWebcam();
  }, []);

  // Function to start speech recognition
  const handleSpeechRecognition = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!stream) {
        setDetectedSpeech("Microphone access denied.");
        return;
      }
  
      setIsListening(true);
      const response = await axios.post("http://127.0.0.1:5000/speech-to-text");
      setIsListening(false);
  
      if (response.data.error) {
        setDetectedSpeech("Error: " + response.data.error);
      } else {
        setDetectedSpeech(response.data.text);
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
      setIsListening(false);
      setDetectedSpeech("An error occurred during speech recognition. Please ensure your microphone is enabled.");
    }
  };
  
  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <section className={styles.contentContainer}>
        {/* Left Section: Webcam */}
        <div className={styles.webcamContainer}>
          <video ref={webcamRef} width="100%" height="auto" autoPlay></video>
        </div>

        <div className={styles.separator}></div>

        {/* Right Section: Eye Test Chart + Log */}
        <div className={styles.eyeTestContainer}>
          <img src={eyeTestImage} alt="Eye Exam Chart" className={styles.eyeTestImage} />

          {/* Eye Status and Distance Log */}
          <div className={styles.logBox}>
            {errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : (
              distance && (
                <p>
                  <strong>Face Distance:</strong> {distance} cm <br />
                  <strong>Eye Status:</strong> {eyeStatus}
                </p>
              )
            )}
          </div>

          {/* Speech Recognition Button */}
          <button className={styles.speechButton} onClick={handleSpeechRecognition} disabled={isListening}>
            {isListening ? "🎙 Listening..." : "🎤 Start Speech Test"}
          </button>

          {/* Display Detected Speech */}
          {detectedSpeech && <p className={styles.detectedSpeech}>🗣 Detected Speech: {detectedSpeech}</p>}
        </div>
      </section>
    </div>
  );
};

export default BothEyePage;
