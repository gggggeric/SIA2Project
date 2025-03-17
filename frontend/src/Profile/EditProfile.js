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
      const [userResponse, colorBlindnessResponse, astigmatismResponse, faceShapeResponse] = await Promise.all([
        axios.get(`http://localhost:5001/users/users/${userId}`),
        axios.get(`http://localhost:5001/color-blindness/color-blindness-test/${userId}`),
        axios.get(`http://localhost:5001/astigmatism/astigmatism-test/${userId}`),
        axios.get(`http://localhost:5001/face-shape/face-shape-history/${userId}`), // Fetch face shape data
      ]);

      // Convert single objects to arrays
      const colorBlindnessTests = colorBlindnessResponse.data ? [colorBlindnessResponse.data] : [];
      const astigmatismTests = astigmatismResponse.data ? [astigmatismResponse.data] : [];
      const faceShapeTests = faceShapeResponse.data || []; // Face shape data

      setUserData({
        user: userResponse.data,
        colorBlindnessTests,
        astigmatismTests,
        faceShapeTests, // Add face shape data to userData
      });

      return {
        user: userResponse.data,
        colorBlindnessTests,
        astigmatismTests,
        faceShapeTests, // Return face shape data
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

    // Create PDF with A4 format and better settings
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Set document properties
    doc.setProperties({
      title: "User Vision Test Report - Optic AI",
      subject: "Vision Test Analysis",
      author: "TUP-Taguig",
      creator: "Optic AI",
    });

    // Convert the logo to a data URL
    const img = new Image();
    img.src = tuplogo;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const logoDataUrl = canvas.toDataURL("image/png");

      // ===== HEADER SECTION =====
      // Add the logo
      doc.addImage(logoDataUrl, "PNG", 15, 15, 25, 25);

      // Add header text with right alignment
      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text("Technological University of the Philippines - Taguig", 195, 20, {
        align: "right",
      });

      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Optic AI - Vision Testing System", 195, 28, { align: "right" });

      // Add date with right alignment
      const today = new Date();
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(`Report Date: ${today.toLocaleDateString()}`, 195, 35, {
        align: "right",
      });

      // Add decorative header line
      doc.setDrawColor(0, 51, 102); // Dark blue
      doc.setLineWidth(0.8);
      doc.line(15, 42, 195, 42);

      // ===== TEAM MEMBERS SECTION =====
      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.text("Team Members:", 15, 50);

      doc.setFontSize(11).setFont("helvetica", "normal");
      const teamMembers = [
        "Morit Geric T.",
        "Bacala Nicole",
        "Gone Krizel",
        "Giana Mico",
      ];

      // Create two-column layout for team members
      const leftCol = teamMembers.slice(0, 2);
      const rightCol = teamMembers.slice(2);

      leftCol.forEach((member, idx) => {
        doc.text(`• ${member}`, 20, 58 + idx * 7);
      });

      rightCol.forEach((member, idx) => {
        doc.text(`• ${member}`, 90, 58 + idx * 7);
      });

      // Add section divider
      doc.setDrawColor(180, 180, 180); // Light gray
      doc.setLineWidth(0.3);
      doc.line(15, 75, 195, 75);

      // ===== USER INFO SECTION =====
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("User Information", 15, 85);

      doc.setFontSize(11).setFont("helvetica", "normal");
      doc.text(`Name: ${userData.user.name}`, 15, 95);
      doc.text(`Email: ${userData.user.email}`, 15, 105);
      doc.text(`Address: ${userData.user.address}`, 15, 115);

      // Add section divider
      doc.setDrawColor(180, 180, 180); // Light gray
      doc.setLineWidth(0.3);
      doc.line(15, 125, 195, 125);

      // ===== VISION TEST RESULTS SECTION =====
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Vision Test Results", 15, 135);

      // Color Blindness Test
      doc.setFontSize(12).setFont("helvetica", "bold"); // Bold heading
      doc.text("Color Blindness Test", 15, 145);
      doc.setFont("helvetica", "normal"); // Reset font to normal

      if (userData.colorBlindnessTests.length > 0) {
        let startY = 155;
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
        doc.text("No color blindness test data available.", 15, 155);
      }

      // Astigmatism Test
      doc.setFontSize(12).setFont("helvetica", "bold"); // Bold heading
      doc.text("Astigmatism Test", 15, 185);
      doc.setFont("helvetica", "normal"); // Reset font to normal

      if (userData.astigmatismTests.length > 0) {
        let startY = 195;
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, startY);
        doc.text("Result", 40, startY);
        doc.text("Date", 130, startY);
      
        doc.setFont("helvetica", "normal");
        userData.astigmatismTests.forEach((test, index) => {
          startY += 10;
      
          // Simplify astigmatism result
          const resultText =
            test.result === "invalid data"
              ? "Data Unavailable"
              : test.result.toLowerCase().includes("both")
              ? "Both Eyes"
              : `Astigmatism symptoms appear in ${test.result.toUpperCase()} eyes.`;
      
          // Wrap the result text to fit within a specific width
          const wrappedResult = doc.splitTextToSize(resultText, 80); // Adjust width as needed
      
          // Parse and format the timestamp
          let testDate = "Invalid Date";
          if (test.timestamp) {
            // Handle nested timestamp (MongoDB format)
            if (test.timestamp.$date && test.timestamp.$date.$numberLong) {
              const timestamp = test.timestamp.$date.$numberLong;
              testDate = new Date(parseInt(timestamp)).toLocaleDateString();
            }
            // Handle plain number timestamp
            else if (typeof test.timestamp === "number") {
              testDate = new Date(test.timestamp).toLocaleDateString();
            }
            // Handle ISO string timestamp
            else if (typeof test.timestamp === "string") {
              testDate = new Date(test.timestamp).toLocaleDateString();
            }
            // Handle direct Date object
            else if (test.timestamp instanceof Date) {
              testDate = test.timestamp.toLocaleDateString();
            }
          }
      
          // Add Test #
          doc.text(`${index + 1}`, 15, startY);
      
          // Add Result (wrapped text)
          doc.text(wrappedResult, 40, startY);
      
          // Add Date
          doc.text(testDate, 130, startY);
      
          // Adjust spacing based on the number of lines in wrappedResult
          startY += wrappedResult.length * 5; // Increase spacing for wrapped text
        });
      } else {
        doc.text("No astigmatism test data available.", 15, 195);
      }

      // ===== FACE SHAPE SECTION =====
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Face Shape Analysis", 15, 225);

      if (userData.faceShapeTests.length > 0) {
        let startY = 235;
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, startY);
        doc.text("Face Shape", 40, startY);
        doc.text("Recommended Glasses", 80, startY);
        doc.text("Date", 130, startY);

        doc.setFont("helvetica", "normal");
        userData.faceShapeTests.forEach((test, index) => {
          startY += 10;

          // Add Test #
          doc.text(`${index + 1}`, 15, startY);

          // Add Face Shape
          doc.text(`${test.faceShape}`, 40, startY);

          // Add Recommended Glasses (with text wrapping)
          const recommendedGlasses = test.recommendedGlasses;
          const wrappedGlasses = doc.splitTextToSize(recommendedGlasses, 50); // Wrap text to fit within 50mm width
          doc.text(wrappedGlasses, 80, startY);

          // Add Date
          doc.text(`${new Date(test.timestamp).toLocaleDateString()}`, 130, startY);

          // Adjust spacing based on the number of lines in wrappedGlasses
          startY += wrappedGlasses.length * 5; // Increase spacing for wrapped text
        });
      } else {
        doc.text("No face shape data available.", 15, 235);
      }

      // ===== FOOTER SECTION =====
      // Add decorative footer line
      doc.setDrawColor(0, 51, 102); // Dark blue
      doc.setLineWidth(0.5);
      doc.line(15, 280, 195, 280);

      // Add footer text with date and time
      doc.setFontSize(8).setFont("helvetica", "italic");
      doc.text("Generated by Optic AI - Vision Testing System", 15, 286);

      doc.setFontSize(8).setFont("helvetica", "normal");
      doc.text(
        `Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
        195,
        286,
        { align: "right" }
      );

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