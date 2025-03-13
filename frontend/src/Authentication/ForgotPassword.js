import { useState } from "react";
import { toast } from "react-toastify"; // Import toast (not ToastContainer)
import "./ForgotPassword.css"; // Import the CSS file
import resetImage from "../assets/forgot.png"; // Add your image here
import Navbar from "../Navigation/Navbar"; // Import Navbar component

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5001/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset link sent! Check your email.", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      } else {
        toast.error(data.error || "Something went wrong.", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    } catch (error) {
      toast.error("Server error, please try again later.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
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
                <button type="submit" className="send-btn">
                  Send Reset Link
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;