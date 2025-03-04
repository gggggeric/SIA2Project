import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./EmailVerification.css"; // Import CSS
import verifyImage from "../assets/forgot.png"; // Add your image here
import Navbar from "../Navigation/Navbar"; // Import Navbar component

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!token) {
      setMessage("Invalid verification link.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`http://localhost:5001/auth/verify-email?token=${token}`, {
          method: "GET",
        });
        const data = await response.json();

        if (response.ok) {
          setMessage("Email verified successfully!");
          setUserName(data.name); // Assuming backend sends `name`
        } else {
          setMessage(data.error || "Verification failed.");
        }
      } catch (error) {
        setMessage("An error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      <Navbar />
      <div className="verification-container">
        <div className="verification-box">
          <div className="image-container">
            <img src={verifyImage} alt="Email Verification" className="verify-image" />
          </div>
          <div className="verification-content">
            <div className="verification-text">
              <h2>Email Verification</h2>
              <p>{message}</p>
              {userName && <h3>Welcome, {userName}!</h3>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EmailVerification;
