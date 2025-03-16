import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import { toast } from "react-toastify";
import { FaPen, FaFileExport } from "react-icons/fa"; // Added FaFileExport for the export icon
import styles from "./EditProfile.module.css";
import jsPDF from "jspdf"; // For generating PDF reports
import tuplogo from "../assets/tuplogo.png"; // Import the logo

const EditProfile = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null); // State to store user data for export

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      alert("User not logged in or invalid session.");
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/users/users/${userId}`);
        const { name, email, address, profile } = response.data;
        setName(name);
        setAddress(address);
        setProfileImageUrl(profile);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const fetchAllUserData = async () => {
    try {
      const [userResponse, colorBlindnessResponse, astigmatismResponse] = await Promise.all([
        axios.get(`http://localhost:5001/users/users/${userId}`),
        axios.get(`http://localhost:5001/color-blindness/color-blindness-test/${userId}`),
        axios.get(`http://localhost:5001/astigmatism/astigmatism-test/${userId}`),
      ]);

      // Convert single objects to arrays
      const colorBlindnessTests = colorBlindnessResponse.data ? [colorBlindnessResponse.data] : [];
      const astigmatismTests = astigmatismResponse.data ? [astigmatismResponse.data] : [];

      setUserData({
        user: userResponse.data,
        colorBlindnessTests,
        astigmatismTests,
      });

      return {
        user: userResponse.data,
        colorBlindnessTests,
        astigmatismTests,
      };
    } catch (error) {
      console.error("Error fetching user data for export", error);
      toast.error("Error fetching data for export!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return null;
    }
  };

  const generatePDFReport = () => {
    if (!userData) {
      toast.error("No data available to export!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    const doc = new jsPDF();

    // Convert the logo to a data URL
    const img = new Image();
    img.src = tuplogo;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      // Add the logo
      doc.addImage(dataUrl, "PNG", 10, 10, 30, 30);

      // Title Section
      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text("Technological University of the Philippines - Taguig", 50, 20);
      doc.setFontSize(14).text("Optic AI - Vision Testing System", 50, 30);

      // Team Names (Left Side)
      doc.setFontSize(12).setFont("helvetica", "normal");
      doc.text("Team Members:", 10, 50);
      doc.text("Morit Geric T.", 10, 60);
      doc.text("Bacala Nicole", 10, 70);
      doc.text("Gone Krizel", 10, 80);
      doc.text("Giana Mico", 10, 90);

      // Divider
      doc.setDrawColor(0).setLineWidth(0.5).line(10, 100, 200, 100);

      // User Info
      doc.setFontSize(12).setFont("helvetica", "normal");
      doc.text(`Name: ${userData.user.name}`, 10, 110);
      doc.text(`Email: ${userData.user.email}`, 10, 120);
      doc.text(`Address: ${userData.user.address}`, 10, 130);

      // Vision Test Results Section
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Vision Test Results", 10, 150);

      // Color Blindness Test
      doc.setFontSize(12).text("Color Blindness Test", 10, 160);
      if (userData.colorBlindnessTests.length > 0) {
        let startY = 170;
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, startY);
        doc.text("Result", 40, startY);
        doc.text("Correct Count", 80, startY);
        doc.text("Date", 130, startY);

        doc.setFont("helvetica", "normal");
        userData.colorBlindnessTests.forEach((test, index) => {
          startY += 10;
          doc.text(`${index + 1}`, 15, startY);
          doc.text(`${test.result}`, 40, startY);
          doc.text(`${test.correctCount}`, 80, startY);
          doc.text(`${new Date(test.timestamp).toLocaleDateString()}`, 130, startY);
        });
      } else {
        doc.text("No color blindness test data available.", 15, 170);
      }

      // Astigmatism Test
      doc.setFontSize(12).text("Astigmatism Test", 10, 200);
      if (userData.astigmatismTests.length > 0) {
        let startY = 210;
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, startY);
        doc.text("Result", 40, startY);
        doc.text("Date", 130, startY);

        doc.setFont("helvetica", "normal");
        userData.astigmatismTests.forEach((test, index) => {
          startY += 10;

          // Simplify astigmatism result
          const resultText = test.result === "invalid data"
            ? "Data Unavailable"
            : test.result.toLowerCase().includes("both")
            ? "Both Eyes"
            : `Astigmatism symptoms appear in ${test.result.toUpperCase()} eyes.`;

          const wrappedResult = doc.splitTextToSize(resultText, 100); // Wrap text for clean layout

          // Parse and format the timestamp
          const timestamp = test.timestamp?.$date?.$numberLong; // Access the nested timestamp
          const testDate = timestamp
            ? new Date(parseInt(timestamp)).toLocaleDateString()
            : "Invalid Date";

          doc.text(`${index + 1}`, 15, startY);
          doc.text(wrappedResult, 40, startY);
          doc.text(testDate, 130, startY);

          startY += wrappedResult.length * 5; // Adjust spacing based on text length
        });
      } else {
        doc.text("No astigmatism test data available.", 15, 210);
      }

      // Footer
      doc.setFontSize(10).setFont("helvetica", "italic");
      doc.text("Generated by Optic AI - Vision Testing System", 10, 280);

      // Save the PDF
      doc.save("user_vision_report.pdf");
    };
  };

  const handleExportData = async () => {
    const data = await fetchAllUserData();
    if (data) {
      generatePDFReport();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
    } else if (name === "address") {
      setAddress(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleProfileImageUpdate = async (e) => {
    e.preventDefault();

    if (!profileImage) {
      toast.error("Please select a profile image to upload.", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    const formData = new FormData();
    formData.append("profileImage", profileImage);

    try {
      const response = await axios.put(
        `http://localhost:5001/users/users/${userId}/uploadProfile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfileImageUrl(response.data.updatedUser.profile);
      toast.success("Profile image updated successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      setShowModal(false);
    } catch (error) {
      console.error("Error updating profile image", error);
      toast.error("Error updating profile image!", {
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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    const updatedData = { name, address, password };
    const dataToUpdate = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== "")
    );

    try {
      const response = await axios.put(
        `http://localhost:5001/users/users/${userId}`,
        dataToUpdate
      );

      toast.success("Profile updated successfully!", {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      setName(response.data.updatedUser.name);
      setAddress(response.data.updatedUser.address);
      setPassword("");
    } catch (error) {
      console.error("Error updating profile", error);
      toast.error("Error updating profile!", {
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
    <div className={styles.rootContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.container}>
          <Navbar />
          <h2 className={styles.title}>Edit Profile</h2>

          <div className={styles.groupBox}>
            <div className={styles.userInfo}>
              <div className={styles.profileImgContainer}>
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className={styles.profileImg}
                  />
                ) : (
                  <div className={styles.profilePlaceholder}>
                    {name.charAt(0)}
                  </div>
                )}
                <div
                  className={styles.editIcon}
                  onClick={() => setShowModal(true)}
                >
                  <FaPen />
                </div>
              </div>
              <div className={styles.userName}>
                <h3>{name}</h3>
                <p className={styles.userEmail}>
                  {localStorage.getItem("email")}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="address">Address</label>
              <input
                type="text"
                id="address"
                name="address"
                value={address}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={handleChange}
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Update Profile
            </button>
          </form>

          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className={styles.exportBtn}
          >
            <FaFileExport /> Export Data/Reports
          </button>
        </div>

        {showModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <h2>Update Profile Image</h2>

              <div className={styles.currentImgContainer}>
                {profileImageUrl ? (
                  <img
                    src={profileImageUrl}
                    alt="Profile"
                    className={styles.currentImg}
                  />
                ) : (
                  <div className={styles.currentImgPlaceholder}>
                    {name.charAt(0)}
                  </div>
                )}
              </div>

              <form onSubmit={handleProfileImageUpdate}>
                <div className={styles.formContainer}>
                  <div className={styles.formGroup}>
                    <label htmlFor="profileImage" className={styles.label}>
                      New Profile Image
                    </label>
                    <input
                      type="file"
                      id="profileImage"
                      onChange={handleFileChange}
                      className={styles.input}
                    />
                  </div>
                  <button type="submit" className={styles.submitBtn}>
                    Update Profile Image
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditProfile;