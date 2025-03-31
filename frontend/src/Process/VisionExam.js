import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Navigation/Navbar";
import axios from "axios";
import styles from "./VisionExam.module.css";
import eyeTestImage from "../assets/eyetest1.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import io from "socket.io-client";

const VisionExamPage = () => {
  // Refs and state management
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [distanceFeedback, setDistanceFeedback] = useState("");
  const [testResults, setTestResults] = useState({
    botheyes: null,
    righteye: null,
    lefteye: null,
  });
  const [allTestResults, setAllTestResults] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [waitingMessage, setWaitingMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [isWithinCorrectDistance, setIsWithinCorrectDistance] = useState(false);
  const [currentTestType, setCurrentTestType] = useState(null);

  // Text-to-speech function
  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Fetch test results when modal opens
  useEffect(() => {
    if (isModalOpen) {
      fetchAllTestResults();
    }
  }, [isModalOpen]);

  // Fetch all test results from backend
  const fetchAllTestResults = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in localStorage");
        toast.error("Please login to view test results", { toastId: 'login-error' });
        return;
      }

      const response = await axios.get(`http://localhost:5001/test/get-test-results/${userId}`);
      if (response.data.allResults) {
        setAllTestResults(response.data.allResults);
      }
    } catch (error) {
      console.error("Error fetching test results:", error);
      toast.error("Failed to load test history", { toastId: 'load-error' });
    }
  };

  // Save test results to backend
  const saveTestResults = async (testType, estimatedEyeGrade, diagnosis) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in localStorage");
        toast.error("Please login to save test results", { toastId: 'save-error' });
        return;
      }

      const response = await axios.post("http://localhost:5001/test/save-test-results", {
        userId,
        testType,
        estimatedEyeGrade,
        diagnosis
      });

      if (response.data.message) {
        toast.success("Test results saved to your account", { toastId: 'save-success' });
      }
    } catch (error) {
      console.error("Error saving test results:", error);
      toast.error("Failed to save test results to server", { toastId: 'save-fail' });
    }
  };

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleTestResult = async (data) => {
      const eyeKey = data.eye.toLowerCase().replace(" ", "");
      
      const newResult = {
        results: data.results,
        estimated_eye_grade: data.estimated_eye_grade,
        diagnosis: data.diagnosis,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => ({
        ...prev,
        [eyeKey]: newResult
      }));

      await saveTestResults(eyeKey, data.estimated_eye_grade, data.diagnosis);

      toast.success(
        `Test completed for ${data.eye}:\nEye Grade: ${data.estimated_eye_grade}\nDiagnosis: ${data.diagnosis}`,
        { 
          autoClose: 5000, 
          position: "top-center",
          toastId: `test-result-${eyeKey}`
        }
      );

      setIsTestRunning(false);
      setIsWaiting(false);
      setCurrentTestType(null);
      speak(`Test completed. Results are ready.`);
    };

    socket.on("vision_test_update", (data) => {
      switch (data.type) {
        case "start":
          setIsTestRunning(true);
          speak(`Please read the row labeled ${data.row_label}: ${data.letters}`);
          break;
        case "waiting":
          setIsWaiting(true);
          setWaitingMessage(data.message);
          speak(data.message);
          break;
        case "retry":
          toast.warn(data.message, { toastId: 'retry-message' });
          speak(data.message);
          break;
        case "result":
          handleTestResult(data);
          break;
        case "error":
          toast.error(data.message, { toastId: 'error-message' });
          setIsTestRunning(false);
          setCurrentTestType(null);
          speak(data.message);
          break;
        default:
          break;
      }
    });

    return () => {
      socket.off("vision_test_update");
    };
  }, [socket]);

  // Check microphone permission
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

  // Set up distance checking interval
  useEffect(() => {
    let interval;
    if (!isWithinCorrectDistance) {
      interval = setInterval(captureImage, 5000);
    }
    return () => clearInterval(interval);
  }, [isWithinCorrectDistance]);

  // Check distance when new image is captured
  useEffect(() => {
    if (image && !isWithinCorrectDistance) {
      checkDistance();
    }
  }, [image, isWithinCorrectDistance]);

  // Initialize webcam
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

  // Calculate user distance from camera
  const checkDistance = async () => {
    if (!image) return;

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

        if (detectedDistance < 40) {
          setDistanceFeedback("Move back to position yourself between 40-60 cm.");
        } else if (detectedDistance >= 40 && detectedDistance <= 60) {
          setDistanceFeedback("You are within the required distance (40-60 cm).");
          setIsWithinCorrectDistance(true);
        } else {
          setDistanceFeedback("Move closer to position yourself between 40-60 cm.");
        }
      }
    } catch (error) {
      console.error("Error checking distance:", error);
      setErrorMessage("An error occurred while processing the image.");
      setDistance(null);
      setDistanceFeedback("");
    }
  };

  // Start vision test
  const handleSpeechRecognition = async (testType) => {
    if (!micPermission) {
      toast.error("Microphone access is required for speech recognition.", { toastId: 'mic-error' });
      return;
    }

    if (!isWithinCorrectDistance) {
      toast.error("Please position yourself between 40-60 cm from the camera.", { toastId: 'distance-error' });
      return;
    }

    if (isTestRunning) {
      toast.warn("A test is already in progress.", { toastId: 'test-running' });
      return;
    }

    setTestResults(prev => ({
      ...prev,
      [testType]: null,
    }));

    setIsListening(true);
    setIsTestRunning(true);
    setCurrentTestType(testType);

    try {
      const endpoint = `http://127.0.0.1:5000/vision-test/${
        testType === "botheyes" ? "both-eyes" : 
        testType === "righteye" ? "right-eye" : "left-eye"
      }`;

      await axios.post(endpoint, {}, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error(`Error during ${testType} test:`, error);
      setIsListening(false);
      setIsTestRunning(false);
      setCurrentTestType(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Modal component
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

  // Test result display component
  const TestResultBox = ({ eye, result }) => {
    if (!result) return null;

    return (
      <div className={styles.resultBox}>
        <h4>
          {eye === 'botheyes' ? '👀 Both Eyes' : 
           eye === 'righteye' ? '👁️ Right Eye' : '👁️ Left Eye'}
        </h4>
        <div className={styles.resultDetails}>
          <p><strong>Visual Acuity:</strong> {result.estimated_eye_grade}</p>
          <p><strong>Diagnosis:</strong> {result.diagnosis}</p>
          
          {result.diagnosis && (
            <div className={styles.recommendationBox}>
              {result.diagnosis.includes("Nearsighted") && (
                <p className={styles.recommendation}>
                  <strong>Recommendation:</strong> Consider concave lenses for distance vision
                </p>
              )}
              {result.diagnosis.includes("Farsighted") && (
                <p className={styles.recommendation}>
                  <strong>Recommendation:</strong> Consider convex lenses for near vision
                </p>
              )}
              {result.diagnosis.includes("Normal") && (
                <p className={styles.recommendation}>
                  <strong>Recommendation:</strong> No corrective lenses needed
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <section className={styles.contentContainer}>
        <div className={styles.webcamContainer}>
          <video ref={webcamRef} autoPlay playsInline></video>
          <div className={styles.logBox}>
            {errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : (
              distance && (
                <p>
                  <strong>Face Distance:</strong> {distance} cm <br />
                  <strong>Status:</strong> {distanceFeedback}
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
          className={`${styles.elegantButton} ${currentTestType === 'botheyes' ? styles.activeButton : ''}`}
          onClick={() => handleSpeechRecognition("botheyes")}
          disabled={isTestRunning || !isWithinCorrectDistance}
        >
          {currentTestType === 'botheyes' ? 'Testing...' : 'Test Both Eyes'}
        </button>
        <button
          className={`${styles.elegantButton} ${currentTestType === 'righteye' ? styles.activeButton : ''}`}
          onClick={() => handleSpeechRecognition("righteye")}
          disabled={isTestRunning || !isWithinCorrectDistance}
        >
          {currentTestType === 'righteye' ? 'Testing...' : 'Test Right Eye'}
        </button>
        <button
          className={`${styles.elegantButton} ${currentTestType === 'lefteye' ? styles.activeButton : ''}`}
          onClick={() => handleSpeechRecognition("lefteye")}
          disabled={isTestRunning || !isWithinCorrectDistance}
        >
          {currentTestType === 'lefteye' ? 'Testing...' : 'Test Left Eye'}
        </button>
        <button 
          className={styles.elegantButton} 
          onClick={() => setIsModalOpen(true)}
        >
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
          <h3>Current Session Results</h3>
          <div className={styles.resultsGrid}>
            {Object.entries(testResults).map(([eye, result]) => (
              result && <TestResultBox 
                key={eye} 
                eye={eye} 
                result={result} 
              />
            ))}
          </div>
          
          <h3>Test History</h3>
          {allTestResults.length > 0 ? (
            <div className={styles.historyTable}>
              <table className={styles.resultsTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Test Type</th>
                    <th>Visual Acuity</th>
                    <th>Diagnosis</th>
                  </tr>
                </thead>
                <tbody>
                  {allTestResults.map((test, index) => (
                    <tr key={index} className={styles.historyRow}>
                      <td>{formatDate(test.createdAt)}</td>
                      <td>
                        {test.testType === 'botheyes' ? 'Both Eyes' : 
                         test.testType === 'righteye' ? 'Right Eye' : 'Left Eye'}
                      </td>
                      <td>{test.estimatedEyeGrade}</td>
                      <td>{test.diagnosis}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.noHistoryMessage}>No test history available.</p>
          )}
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
        closeButton={({ closeToast }) => (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              closeToast();
            }}
            className={styles.toastCloseButton}
          >
            ×
          </button>
        )}
      />
    </div>
  );
};

export default VisionExamPage;