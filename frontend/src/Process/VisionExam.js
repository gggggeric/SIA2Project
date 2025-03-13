import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Navigation/Navbar";
import axios from "axios";
import styles from "./VisionExam.module.css";
import eyeTestImage from "../assets/eyetest1.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";

const VisionExamPage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [expectedDistance, setExpectedDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [distanceFeedback, setDistanceFeedback] = useState("");

  const [detectedSpeech, setDetectedSpeech] = useState({
    botheyes: null,
    righteye: null,
    lefteye: null,
  });

  const [currentTestDistance, setCurrentTestDistance] = useState("");
  const [testInstructions, setTestInstructions] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentTestType, setCurrentTestType] = useState(null);
  const [expectedLetters, setExpectedLetters] = useState("");
  const [rowLabel, setRowLabel] = useState("");
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [isCountdownModalOpen, setIsCountdownModalOpen] = useState(false);

  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");

  const [socket, setSocket] = useState(null);

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("vision_test_update", (data) => {
        console.log("WebSocket event received:", data);
        switch (data.type) {
          case "start":
            setCurrentTestType(data.test_type);
            setRowLabel(data.row_label);
            setExpectedLetters(data.letters);
            setIsTestRunning(true);
            setIsCountdownModalOpen(true);
            speak(`Please read the row labeled ${data.row_label}: ${data.letters}`);
            break;
          case "countdown":
            setCountdown(data.count);
            speak(data.count.toString());
            break;
          case "waiting":
            setIsWaiting(true);
            setWaitingMessage(data.message);
            speak(data.message);
            break;
          case "retry":
            toast.warn(data.message);
            speak(data.message);
            break;
          case "delay":
            toast.info(data.message);
            speak(data.message);
            break;
          case "listening":
            toast.info(data.message);
            speak(data.message);
            break;
          case "error":
            toast.error(data.message);
            setIsTestRunning(false);
            speak(data.message);
            break;
          case "result":
            const eyeKey = data.eye.toLowerCase().replace(" ", "");
            setDetectedSpeech((prev) => ({
              ...prev,
              [eyeKey]: {
                results: data.results,
                smallest_readable_row: data.smallest_readable_row,
                estimated_eye_grade: data.estimated_eye_grade,
                diagnosis: data.diagnosis,
              },
            }));

            // Show pop-up notification with eye grade and diagnosis
            toast.success(
              `Test completed for ${data.eye}:\nEye Grade: ${data.estimated_eye_grade}\nDiagnosis: ${data.diagnosis}`,
              {
                autoClose: 5000,
                position: "top-center",
              }
            );

            // Save results to localStorage
            const savedResults = JSON.parse(localStorage.getItem("testResults") || "{}");
            savedResults[eyeKey] = {
              estimated_eye_grade: data.estimated_eye_grade,
              diagnosis: data.diagnosis,
            };
            localStorage.setItem("testResults", JSON.stringify(savedResults));

            // Send results to the backend for saving
            const userId = localStorage.getItem("userId"); // Ensure userId is stored in localStorage
            if (userId) {
              axios
                .post("http://localhost:5001/test/save-test-results", {
                  userId,
                  testType: eyeKey,
                  estimatedEyeGrade: data.estimated_eye_grade,
                  diagnosis: data.diagnosis,
                })
                .then((response) => {
                  console.log("Test results saved to the database:", response.data);
                })
                .catch((error) => {
                  console.error("Error saving test results:", error);
                });
            }

            setIsTestRunning(false);
            setIsWaiting(false);
            speak(`Test completed. Results are ready.`);
            break;
          default:
            break;
        }
      });
    }
  }, [socket]);

  useEffect(() => {
    if (countdown === 1) {
      const timer = setTimeout(() => {
        setIsCountdownModalOpen(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

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
          setErrorMessage(null);
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

    // Reset the results for the current test type
    setDetectedSpeech((prev) => ({
      ...prev,
      [testType]: null,
    }));

    setIsListening(true);
    setIsTestRunning(true);

    try {
      let endpoint = "";
      if (testType === "bothEyes") {
        endpoint = "/vision-test/both-eyes";
      } else if (testType === "rightEye") {
        endpoint = "/vision-test/right-eye";
      } else if (testType === "leftEye") {
        endpoint = "/vision-test/left-eye";
      }

      const response = await axios.post(`http://127.0.0.1:5000${endpoint}`, {}, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data) {
        setDetectedSpeech((prev) => ({
          ...prev,
          [testType]: response.data,
        }));
      }
    } catch (error) {
      console.error(`❌ Error during ${testType} test:`, error);
      setIsListening(false);
      setIsTestRunning(false);
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
        <button
          className={styles.elegantButton}
          onClick={() => handleSpeechRecognition("bothEyes")}
          disabled={isTestRunning}
        >
          Test Both Eyes
        </button>
        <button
          className={styles.elegantButton}
          onClick={() => handleSpeechRecognition("rightEye")}
          disabled={isTestRunning}
        >
          Test Right Eye
        </button>
        <button
          className={styles.elegantButton}
          onClick={() => handleSpeechRecognition("leftEye")}
          disabled={isTestRunning}
        >
          Test Left Eye
        </button>
        <button className={styles.elegantButton} onClick={() => setIsModalOpen(true)}>
          View Results
        </button>
      </div>

      {isWaiting && (
        <div className={styles.waitingModal}>
          <div className={styles.waitingContent}>
            <h2>Please Wait</h2>
            <p>{waitingMessage}</p>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className={styles.testResults}>
          <h3>Test Results</h3>
          <div className={styles.horizontalResults}>
            {Object.entries(detectedSpeech).map(([eye, result]) => (
              <div key={eye} className={styles.resultBox}>
                <h4>{eye === 'botheyes' ? '👀 Both Eyes' : eye === 'righteye' ? '👁️ Right Eye' : '👁️ Left Eye'}</h4>
                {result ? (
                  <>
                    <p><strong>Estimated Eye Grade:</strong> {result.estimated_eye_grade}</p>
                    <p><strong>Diagnosis:</strong> {result.diagnosis}</p>
                  </>
                ) : (
                  <p>No test results available.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>

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