import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Navigation/Navbar";
import axios from "axios";
import styles from "./BothEye.module.css";
import eyeTestImage from "../assets/eyetest1.png";

const BothEyePage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [expectedDistance, setExpectedDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [distanceFeedback, setDistanceFeedback] = useState("");

  // State for detected speech results
  const [detectedSpeech, setDetectedSpeech] = useState(() => {
    const savedSpeech = localStorage.getItem("detectedSpeech");
    return savedSpeech ? JSON.parse(savedSpeech) : { bothEyes: null, rightEye: null, leftEye: null };
  });

  // State for current test level and letters to read
  const [currentTestLevel, setCurrentTestLevel] = useState("");

  // State for microphone permission and listening status
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState(false);

  // State for test instructions
  const [testInstructions, setTestInstructions] = useState("");

  // State for current test distance
  const [currentTestDistance, setCurrentTestDistance] = useState("");

  // Save detected speech to localStorage
  useEffect(() => {
    localStorage.setItem("detectedSpeech", JSON.stringify(detectedSpeech));
  }, [detectedSpeech]);

  // Request microphone permission on component mount
  useEffect(() => {
    const getMicPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicPermission(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        setMicPermission(false);
      }
    };
    getMicPermission();
  }, []);

  // Capture image from webcam every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      captureImage();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate face distance when a new image is captured
  useEffect(() => {
    if (image) {
      calculateFaceDistance();
    }
  }, [image]);

  // Start webcam on component mount
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
        setErrorMessage("Unable to access the webcam.");
      }
    };
    startWebcam();
  }, []);

  // Capture image from webcam
  const captureImage = () => {
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

  // Calculate face distance using the backend API
  const calculateFaceDistance = async () => {
    if (image) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/calculate-distance", {
          image: image.split(",")[1], // Send base64 encoded image data
        });

        console.log("Face distance response:", response.data);

        if (response.data.error) {
          setErrorMessage(response.data.error);
          setDistance(null);
          setDistanceFeedback("");
        } else {
          setDistance(response.data.distance_cm);
          setExpectedDistance(response.data.expected_distance_cm);
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
        setDistanceFeedback("");
      }
    }
  };

  const handleSpeechRecognition = async (testType) => {
    if (!micPermission) {
      alert("Microphone access is required for speech recognition.");
      return;
    }

    setIsListening(true);

    try {
      let endpoint = "";
      if (testType === "bothEyes") endpoint = "/vision-test/both-eyes";
      else if (testType === "rightEye") endpoint = "/vision-test/right-eye";
      else if (testType === "leftEye") endpoint = "/vision-test/left-eye";

      // Start the near vision test (40-50 cm)
      setCurrentTestDistance("40-50 cm"); // Set current test distance
      setTestInstructions("Testing at 40-50 cm... Please read the following letters:");
      const nearResponse = await axios.post(`http://127.0.0.1:5000${endpoint}`, {}, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Near vision test response:", nearResponse.data);

      // Update test instructions
      setTestInstructions(`Say these letters: ${nearResponse.data.near_test_characters.join(", ")}`);

      // Update detected speech results
      setDetectedSpeech((prev) => ({
        ...prev,
        [testType]: {
          near: nearResponse.data,
          diagnosis: nearResponse.data.diagnosis,
        },
      }));

      // Delay before starting the far test (80-100 cm)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Start the far vision test (80-100 cm)
      setCurrentTestDistance("80-100 cm"); // Set current test distance
      setTestInstructions("Testing at 80-100 cm... Please read the following letters:");
      const farResponse = await axios.post(`http://127.0.0.1:5000${endpoint}`, {}, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("✅ Far vision test response:", farResponse.data);

      setDetectedSpeech((prev) => ({
        ...prev,
        [testType]: { error: "An error occurred during speech recognition." },
      }));

      setIsListening(false);
    } catch (error) {
      console.error("❌ Speech recognition error:", error);
      setIsListening(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <section className={styles.contentContainer}>
        <div className={styles.webcamContainer}>
          <video ref={webcamRef} autoPlay></video>
          <div className={styles.logBox}>
            {errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : (
              distance && (
                <p>
                  <strong>Face Distance:</strong> {distance} cm <br />
                  <strong>Expected Distance:</strong> {expectedDistance} cm <br />
                  <strong>Distance Feedback:</strong> {distanceFeedback}
                </p>
              )
            )}
          </div>
        </div>

        <div className={styles.separator}></div>

        <div className={styles.eyeTestContainer}>
          <img src={eyeTestImage} alt="Eye Exam Chart" className={styles.eyeTestImage} />
        </div>
      </section>

   

      <div className={styles.buttons}>
        <button onClick={() => handleSpeechRecognition("bothEyes")}>Test Both Eyes</button>
        <button onClick={() => handleSpeechRecognition("rightEye")}>Test Right Eye</button>
        <button onClick={() => handleSpeechRecognition("leftEye")}>Test Left Eye</button>
      </div>
    </div>
  );
};

export default BothEyePage;
