import React, { useRef, useState, useEffect } from "react";
import Navbar from "../Navigation/Navbar";
import axios from "axios";
import styles from './BothEye.module.css'; // Importing CSS Module

const BothEyePage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const calculateFaceDistance = async () => {
    if (image) {
      console.log("Sending image to backend...");
      try {
        const response = await axios.post("http://127.0.0.1:5000/calculate-distance", {
          image: image.split(",")[1], // Send base64 image data
        });
        console.log(response.data);

        if (response.data.error) {
          setErrorMessage(response.data.error);
          setDistance(null);
        } else {
          setDistance(response.data.distance);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error("Error calculating distance:", error);
        setErrorMessage("An error occurred while processing the image.");
        setDistance(null);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (webcamRef.current) {
        const video = webcamRef.current;
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setImage(canvas.toDataURL("image/jpeg"));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  useEffect(() => {
    if (image) {
      calculateFaceDistance();
    }
  }, [image]);

  return (
    <div className={styles.pageContainer}>
      <Navbar />
      <section className={styles.contentContainer}>
        <div className={styles.webcamContainer}>
          <video ref={webcamRef} width="100%" height="auto" autoPlay></video>
        </div>
        <div className={styles.separator}></div>
        <div className={styles.groupBox}>
          <h2>Both Eye Process</h2>
          <p>Follow the steps to proceed with the process.</p>
          <ul>
            <li>✅ Ensure both eyes are properly positioned in the camera view.</li>
            <li>✅ Make sure there is enough lighting for proper eye detection.</li>
            <li>✅ Follow the on-screen instructions for optimal results.</li>
          </ul>
          <div>
            {errorMessage ? (
              <p className={styles.errorMessage}>{errorMessage}</p>
            ) : (
              distance && <p>Face Distance: {distance} units</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BothEyePage;
