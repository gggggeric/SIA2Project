import { useState } from "react";
import "./ForgotPassword.css"; // Import the CSS file
import resetImage from "../assets/forgot.png"; // Add your image here
import Navbar from "../Navigation/Navbar"; // Import Navbar component

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:5001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset link sent! Check your email.");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (error) {
      setMessage("Server error, please try again later.");
    }
  };

  return (
    <>
      <Navbar /> {/* Added Navbar here */}
      <div className="reminders-container">
        <div className="reminders-box">
          <div className="image-container">
            <img src={resetImage} alt="Reset Password" className="reset-image" />
          </div>
          <div className="reminders-content">
            <div className="reminders-text">
              <h2>Forgot Your Password?</h2>
              <p>Enter your email below, and we'll send you a password reset link.</p>
              <form onSubmit={handleForgotPassword}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="email-input"
                />
                <button type="submit" className="send-btn">Send Reset Link</button>
              </form>
              {message && <p className="message">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
