import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Navigation/Navbar";
import axios from "axios";
import styles from "./VisionExam.module.css";
import eyeTestImage from "../assets/eyetest1.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const VisionExamPage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [expectedDistance, setExpectedDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [distanceFeedback, setDistanceFeedback] = useState("");

  const [detectedSpeech, setDetectedSpeech] = useState(() => {
    const savedSpeech = localStorage.getItem("detectedSpeech");
    return savedSpeech
      ? JSON.parse(savedSpeech)
      : { bothEyes: null, rightEye: null, leftEye: null };
  });

  const [currentTestDistance, setCurrentTestDistance] = useState("");
  const [testInstructions, setTestInstructions] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("detectedSpeech", JSON.stringify(detectedSpeech));
  }, [detectedSpeech]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      captureImage();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (image) {
      calculateFaceDistance();
    }
  }, [image]);

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

  const calculateFaceDistance = async () => {
    if (image) {
      try {
        const response = await axios.post("http://127.0.0.1:5000/calculate-distance", {
          image: image.split(",")[1],
        });

        if (response.data.error) {
          setErrorMessage(response.data.error);
          setDistance(null);
          setDistanceFeedback("");
        } else {
          const detectedDistance = response.data.distance_cm;
          setDistance(detectedDistance);
          setExpectedDistance(response.data.expected_distance_cm);

          if (detectedDistance < 40) {
            setDistanceFeedback("Move back for better accuracy.");
          } else if (detectedDistance >= 40 && detectedDistance <= 50) {
            setDistanceFeedback("Perfect distance for Myopia test.");
          } else if (detectedDistance >= 60 && detectedDistance <= 100) {
            setDistanceFeedback("Perfect distance for Hyperopia test.");
          } else {
            setDistanceFeedback("Move closer for better accuracy.");
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
      if (testType === "bothEyes") {
        endpoint = "/vision-test/both-eyes";
      } else if (testType === "rightEye") {
        endpoint = "/vision-test/right-eye";
      } else if (testType === "leftEye") {
        endpoint = "/vision-test/left-eye";
      }

      // Call the backend to start the vision test
      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, {}, {
        headers: { "Content-Type": "application/json" },
      });

      // Extract the expected chart letters from the backend's response
      const expectedText = response.data.near_spoken_text || response.data.far_spoken_text;

      if (expectedText) {
        // Show an alert with the expected chart letters
        alert(`Please read the chart showing: ${expectedText}`);

        // Show a toast notification
        toast.info(`Please read the chart showing: ${expectedText}`, {
          position: "top-center",
          autoClose: 5000, // Close after 5 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }

      setDetectedSpeech((prev) => ({
        ...prev,
        [testType]: response.data,
      }));

      setIsListening(false);
    } catch (error) {
      console.error(`❌ Error during ${testType} test:`, error);
      setIsListening(false);
    }
  };

  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
          {children}
        </div>
      </div>
    );
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
        <button className={styles.elegantButton} onClick={() => handleSpeechRecognition("bothEyes")}>
          Test Both Eyes
        </button>
        <button className={styles.elegantButton} onClick={() => handleSpeechRecognition("rightEye")}>
          Test Right Eye
        </button>
        <button className={styles.elegantButton} onClick={() => handleSpeechRecognition("leftEye")}>
          Test Left Eye
        </button>
        <button className={styles.elegantButton} onClick={() => setIsModalOpen(true)}>
          View Results
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.testResults}>
          <h3>Test Results</h3>
          <div className={styles.horizontalResults}>
            {Object.entries(detectedSpeech).map(([eye, result]) => (
              <div key={eye} className={styles.resultBox}>
                <h4>{eye === 'bothEyes' ? '👀 Both Eyes' : eye === 'rightEye' ? '👁️ Right Eye' : '👁️ Left Eye'}</h4>
                {Object.entries(result).map(([key, value]) => (
                  <p key={key}>
                    <strong>{key.replace('_', ' ')}:</strong> {value || 'Unknown'}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default VisionExamPage;