import React, { useRef, useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa"; // Importing the right arrow icon from react-icons
import Navbar from "../Navigation/Navbar"; // Assuming you have a Navbar component
import axios from "axios";
import './BothEye.css'; // Custom CSS for styling

const BothEyePage = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [distance, setDistance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null); // New state for error message

  // Send captured image to the backend for distance calculation
  const calculateFaceDistance = async () => {
    if (image) {
      console.log("Sending image to backend...");
      try {
        const response = await axios.post("http://127.0.0.1:5000/calculate-distance", {
          image: image.split(",")[1], // Send only the base64 image data (without the data URL prefix)
        });
        console.log(response.data); // Log the response from the backend

        if (response.data.error) {
          // If error is returned from the backend, update the error message
          setErrorMessage(response.data.error);
          setDistance(null); // Clear previous distance
        } else {
          setDistance(response.data.distance);
          setErrorMessage(null); // Clear any previous error messages
        }
      } catch (error) {
        console.error("Error calculating distance:", error);
        setErrorMessage("An error occurred while processing the image.");
        setDistance(null);
      }
    }
  };

  // Capture image from webcam every 5 seconds
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
    }, 5000); // Capture every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Start webcam on page load
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
      calculateFaceDistance(); // Calculate distance after capturing an image
    }
  }, [image]);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <Navbar /> {/* Your Navbar */}

      <section className="text-center">
        <div className="container mx-auto p-5">
          <div className="both-eye-box">
            <h2 className="text-2xl font-bold mb-4">Both Eye Process</h2>
            <p className="text-lg mb-4">Follow the steps to proceed with the process.</p>

            <ul className="text-left">
              <li>Ensure both eyes are properly positioned in the camera view</li>
              <li>Make sure there is enough lighting for proper eye detection</li>
              <li>Follow the on-screen instructions for optimal results</li>
            </ul>

            {/* Webcam Display */}
            <div className="webcam-container mt-4">
              <video ref={webcamRef} width="100%" height="auto" autoPlay></video>
            </div>

            {/* Display Distance or Error Message */}
            <div className="mt-4">
              {errorMessage ? (
                <p className="text-xl font-semibold text-red-500">{errorMessage}</p>
              ) : (
                distance && <p className="text-xl font-semibold">Face Distance: {distance} units</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BothEyePage;
