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
  const [distanceFeedback, setDistanceFeedback] = useState("");

  const [detectedSpeech, setDetectedSpeech] = useState({
    bothEyes: null,
    rightEye: null,
    leftEye: null,
  });

  const [isListening, setIsListening] = useState(false);
  const [currentTest, setCurrentTest] = useState("bothEyes");

  // Capture webcam image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      captureImage();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Process captured image
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

  const captureImage = async () => {
    if (webcamRef.current) {
      const video = webcamRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      setImage(canvas.toDataURL("image/jpeg"));
    }
  };

  const calculateFaceDistance = async () => {
    if (image) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/calculate-distance", {
          image: image.split(",")[1],
        });

        if (response.data.error) {
          setErrorMessage(response.data.error);
          setDistance(null);
          setEyeStatus(null);
          setDistanceFeedback("");
        } else {
          setDistance(response.data.distance_cm);
          setEyeStatus(response.data.eye_status);
          setErrorMessage(null);

          if (response.data.distance_cm < 20) {
            setDistanceFeedback("Move back for better accuracy.");
          } else if (response.data.distance_cm > 100) {
            setDistanceFeedback("Move closer for better accuracy.");
          } else {
            setDistanceFeedback("Good distance detected.");
          }
        }
      } catch (error) {
        console.error("Error calculating distance:", error);
        setErrorMessage("An error occurred while processing the image.");
        setDistance(null);
        setEyeStatus(null);
        setDistanceFeedback("");
      }
    }
  };

  // Function to start speech recognition
  const handleSpeechRecognition = async (testType) => {
    setIsListening(true);
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!stream) {
        setDetectedSpeech((prev) => ({ ...prev, [testType]: "Microphone access denied." }));
        setIsListening(false);
        return;
      }

      const response = await axios.post("http://127.0.0.1:5000/speech-to-text");
      setIsListening(false);

      if (response.data.error) {
        setDetectedSpeech((prev) => ({
          ...prev,
          [testType]: "Error: " + response.data.error,
        }));
      } else {
        setDetectedSpeech((prev) => ({
          ...prev,
          [testType]: response.data.text,
        }));
      }
    } catch (error) {
      console.error("Speech recognition error:", error);
      setIsListening(false);
      setDetectedSpeech((prev) => ({
        ...prev,
        [testType]: "An error occurred during speech recognition. Please ensure your microphone is enabled.",
      }));
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <section className={styles.contentContainer}>
        <div className={styles.webcamContainer}>
          <video ref={webcamRef} width="100%" height="auto" autoPlay></video>
        </div>

        <div className={styles.separator}></div>

        <div className={styles.eyeTestContainer}>
          <img src={eyeTestImage} alt="Eye Exam Chart" className={styles.eyeTestImage} />

          <div className={styles.logBox}>
            {errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : (
              distance && (
                <p>
                  <strong>Face Distance:</strong> {distance} cm <br />
                  <strong>Eye Status:</strong> {eyeStatus} <br />
                  <strong>Distance Feedback:</strong> {distanceFeedback}
                </p>
              )
            )}
          </div>

          <div className={styles.testButtons}>
            {!isListening ? (
              <>
                <button
                  className={styles.speechButton}
                  onClick={() => handleSpeechRecognition("bothEyes")}
                >
                  👀 Test Both Eyes
                </button>
                <button
                  className={styles.speechButton}
                  onClick={() => handleSpeechRecognition("rightEye")}
                >
                  👁 Test Right Eye
                </button>
                <button
                  className={styles.speechButton}
                  onClick={() => handleSpeechRecognition("leftEye")}
                >
                  👁 Test Left Eye
                </button>
              </>
            ) : (
              <p>Listening...</p>
            )}
          </div>

          <div className={styles.detectedSpeechBox}>
            <p><strong>👀 Both Eyes:</strong> {detectedSpeech.bothEyes || "Not tested yet"}</p>
            <p><strong>👁 Right Eye:</strong> {detectedSpeech.rightEye || "Not tested yet"}</p>
            <p><strong>👁 Left Eye:</strong> {detectedSpeech.leftEye || "Not tested yet"}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BothEyePage;
