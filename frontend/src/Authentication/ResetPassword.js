import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Import toast (not ToastContainer)
import "./ResetPassword.css"; // Import the CSS file
import resetImage from "../assets/reset.png"; // Add your image here
import Navbar from "../Navigation/Navbar"; // Import Navbar component

const ResetPassword = () => {
  const { token } = useParams(); // Get the token from the URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5001/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password reset successful! Redirecting...", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });

        setTimeout(() => navigate("/login"), 3000);
      } else {
        toast.error(data.error || "Failed to reset password.", {
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
      toast.error("An error occurred. Please try again later.", {
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
      <Navbar />
      <div className="reset-container">
        <div className="reset-box">
          <div className="image-container">
            <img src={resetImage} alt="Reset Password" className="reset-image" />
          </div>
          <div className="reset-content">
            <div className="reset-text">
              <h2>Reset Your Password</h2>
              <p>Enter a new password for your account.</p>
              <form onSubmit={handleResetPassword}>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="password-input"
                />
                <button type="submit" className="reset-btn">
                  Reset Password
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;