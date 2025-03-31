import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import { toast } from "react-toastify";
import { FaPen, FaFileExport } from "react-icons/fa";
import styles from "./EditProfile.module.css";
import jsPDF from "jspdf";
import tuplogo from "../assets/tuplogo.png";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [visionTestResults, setVisionTestResults] = useState([]);

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

  const fetchVisionTestResults = async () => {
    try {
      const response = await axios.get(`http://localhost:5001/test/get-test-results/${userId}`);
      setVisionTestResults(response.data.allResults || []);
      return response.data.allResults || [];
    } catch (error) {
      console.error("Error fetching vision test results:", error);
      return [];
    }
  };

  const fetchAllUserData = async () => {
    try {
      const [
        userResponse,
        colorBlindnessResponse,
        astigmatismResponse,
        faceShapeResponse,
        visionTestsResponse
      ] = await Promise.all([
        axios.get(`http://localhost:5001/users/users/${userId}`),
        axios.get(`http://localhost:5001/color-blindness/color-blindness-test/${userId}`),
        axios.get(`http://localhost:5001/astigmatism/astigmatism-test/${userId}`),
        axios.get(`http://localhost:5001/face-shape/face-shape-history/${userId}`),
        fetchVisionTestResults()
      ]);

      const colorBlindnessTests = colorBlindnessResponse.data ? [colorBlindnessResponse.data] : [];
      const astigmatismTests = astigmatismResponse.data ? [astigmatismResponse.data] : [];
      const faceShapeTests = faceShapeResponse.data || [];
      const visionTests = Array.isArray(visionTestsResponse) ? visionTestsResponse : [];

      setUserData({
        user: userResponse.data,
        colorBlindnessTests,
        astigmatismTests,
        faceShapeTests,
        visionTests
      });

      return {
        user: userResponse.data,
        colorBlindnessTests,
        astigmatismTests,
        faceShapeTests,
        visionTests
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

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setProperties({
      title: "User Vision Test Report - Optic AI",
      subject: "Vision Test Analysis",
      author: "TUP-Taguig",
      creator: "Optic AI",
    });

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
      doc.addImage(logoDataUrl, "PNG", 15, 15, 25, 25);
      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text("Technological University of the Philippines - Taguig", 195, 20, {
        align: "right",
      });

      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Optic AI - Vision Testing System", 195, 28, { align: "right" });

      const today = new Date();
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(`Report Date: ${today.toLocaleDateString()}`, 195, 35, {
        align: "right",
      });

      doc.setDrawColor(0, 51, 102);
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

      const leftCol = teamMembers.slice(0, 2);
      const rightCol = teamMembers.slice(2);

      leftCol.forEach((member, idx) => {
        doc.text(`• ${member}`, 20, 58 + idx * 7);
      });

      rightCol.forEach((member, idx) => {
        doc.text(`• ${member}`, 90, 58 + idx * 7);
      });

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(15, 75, 195, 75);

      // ===== USER INFO SECTION =====
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("User Information", 15, 85);

      doc.setFontSize(11).setFont("helvetica", "normal");
      doc.text(`Name: ${userData.user.name}`, 15, 95);
      doc.text(`Email: ${userData.user.email}`, 15, 105);
      doc.text(`Address: ${userData.user.address}`, 15, 115);

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.3);
      doc.line(15, 125, 195, 125);

      // ===== VISION TEST RESULTS SECTION =====
      let currentY = 135; // Track current Y position for dynamic content placement

      // Vision Diagnostic Tests
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Vision Test Results", 15, currentY);
      currentY += 15;

      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.text("Vision Diagnostic Tests", 15, currentY);
      currentY += 10;

      if (userData.visionTests.length > 0) {
        // Table headers
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, currentY);
        doc.text("Test Type", 30, currentY);
        doc.text("Diagnosis", 60, currentY);
        doc.text("Eye Grade", 100, currentY);
        doc.text("Date", 130, currentY);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        userData.visionTests.forEach((test, index) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            // Redraw headers on new page
            doc.setFontSize(10).setFont("helvetica", "bold");
            doc.text("Test #", 15, currentY);
            doc.text("Test Type", 30, currentY);
            doc.text("Diagnosis", 60, currentY);
            doc.text("Eye Grade", 100, currentY);
            doc.text("Date", 130, currentY);
            currentY += 7;
          }

          doc.text(`${index + 1}`, 15, currentY);
          doc.text(`${test.testType || 'N/A'}`, 30, currentY);

          // Wrap diagnosis text if it's too long
          const diagnosisLines = doc.splitTextToSize(test.diagnosis || 'N/A', 40);
          doc.text(diagnosisLines, 60, currentY);

          doc.text(`${test.estimatedEyeGrade || 'N/A'}`, 100, currentY);

          // Handle different timestamp formats
          let testDate = "N/A";
          if (test.createdAt) {
            if (test.createdAt.$date) {
              testDate = new Date(parseInt(test.createdAt.$date.$numberLong)).toLocaleDateString();
            } else {
              testDate = new Date(test.createdAt).toLocaleDateString();
            }
          }
          doc.text(testDate, 130, currentY);

          // Adjust Y position based on wrapped text height
          currentY += Math.max(10, (diagnosisLines.length - 1) * 5);
        });
      } else {
        doc.text("No vision diagnostic test data available.", 15, currentY);
        currentY += 10;
      }

      // Add space between sections
      currentY += 10;

      // Color Blindness Test
      // Check if we need a new page before starting this section
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.text("Color Blindness Test", 15, currentY);
      currentY += 10;

      if (userData.colorBlindnessTests.length > 0) {
        // Table headers
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, currentY);
        doc.text("Result", 40, currentY);
        doc.text("Correct Count", 80, currentY);
        doc.text("Date", 130, currentY);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        userData.colorBlindnessTests.forEach((test, index) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            // Redraw headers on new page
            doc.setFontSize(10).setFont("helvetica", "bold");
            doc.text("Test #", 15, currentY);
            doc.text("Result", 40, currentY);
            doc.text("Correct Count", 80, currentY);
            doc.text("Date", 130, currentY);
            currentY += 7;
          }

          doc.text(`${index + 1}`, 15, currentY);
          doc.text(`${test.result}`, 40, currentY);
          doc.text(`${test.correctCount}`, 80, currentY);
          doc.text(`${new Date(test.timestamp).toLocaleDateString()}`, 130, currentY);
          currentY += 10;
        });
      } else {
        doc.text("No color blindness test data available.", 15, currentY);
        currentY += 10;
      }

      // Add space between sections
      currentY += 10;

      // Astigmatism Test
      // Check if we need a new page before starting this section
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.text("Astigmatism Test", 15, currentY);
      currentY += 10;

      if (userData.astigmatismTests.length > 0) {
        // Table headers
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, currentY);
        doc.text("Result", 40, currentY);
        doc.text("Date", 130, currentY);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        userData.astigmatismTests.forEach((test, index) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            // Redraw headers on new page
            doc.setFontSize(10).setFont("helvetica", "bold");
            doc.text("Test #", 15, currentY);
            doc.text("Result", 40, currentY);
            doc.text("Date", 130, currentY);
            currentY += 7;
          }

          const resultText =
            test.result === "invalid data"
              ? "Data Unavailable"
              : test.result.toLowerCase().includes("both")
                ? "Both Eyes"
                : `Astigmatism symptoms appear in ${test.result.toUpperCase()} eyes.`;

          const wrappedResult = doc.splitTextToSize(resultText, 80);

          // Handle the timestamp correctly
          let testDate = "N/A";
          if (test.timestamp) {
            if (test.timestamp.$date) {
              testDate = new Date(parseInt(test.timestamp.$date.$numberLong)).toLocaleDateString();
            }
            else if (test.timestamp instanceof Date) {
              testDate = test.timestamp.toLocaleDateString();
            }
            else if (typeof test.timestamp === "string") {
              testDate = new Date(test.timestamp).toLocaleDateString();
            }
          }

          doc.text(`${index + 1}`, 15, currentY);
          doc.text(wrappedResult, 40, currentY);
          doc.text(testDate, 130, currentY);

          currentY += Math.max(10, wrappedResult.length * 5);
        });
      } else {
        doc.text("No astigmatism test data available.", 15, currentY);
        currentY += 10;
      }

      // Add space between sections
      currentY += 10;

      // Face Shape Analysis
      // Check if we need a new page before starting this section
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.text("Face Shape Analysis", 15, currentY);
      currentY += 10;

      if (userData.faceShapeTests.length > 0) {
        // Table headers
        doc.setFontSize(10).setFont("helvetica", "bold");
        doc.text("Test #", 15, currentY);
        doc.text("Face Shape", 40, currentY);
        doc.text("Recommended Glasses", 80, currentY);
        doc.text("Date", 130, currentY);
        currentY += 7;

        doc.setFont("helvetica", "normal");
        userData.faceShapeTests.forEach((test, index) => {
          // Check if we need a new page
          if (currentY > 270) {
            doc.addPage();
            currentY = 20;
            // Redraw headers on new page
            doc.setFontSize(10).setFont("helvetica", "bold");
            doc.text("Test #", 15, currentY);
            doc.text("Face Shape", 40, currentY);
            doc.text("Recommended Glasses", 80, currentY);
            doc.text("Date", 130, currentY);
            currentY += 7;
          }

          doc.text(`${index + 1}`, 15, currentY);
          doc.text(`${test.faceShape}`, 40, currentY);

          const recommendedGlasses = test.recommendedGlasses;
          const wrappedGlasses = doc.splitTextToSize(recommendedGlasses, 50);
          doc.text(wrappedGlasses, 80, currentY);

          doc.text(`${new Date(test.timestamp).toLocaleDateString()}`, 130, currentY);

          currentY += Math.max(10, wrappedGlasses.length * 5);
        });
      } else {
        doc.text("No face shape data available.", 15, currentY);
        currentY += 10;
      }

      // ===== FOOTER SECTION =====
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        // Footer line
        doc.setDrawColor(0, 51, 102);
        doc.setLineWidth(0.5);
        doc.line(15, 280, 195, 280);

        // Footer text
        doc.setFontSize(8).setFont("helvetica", "italic");
        doc.text("Generated by Optic AI - Vision Testing System", 15, 286);

        doc.setFontSize(8).setFont("helvetica", "normal");
        doc.text(
          `Page ${i} of ${pageCount} | Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`,
          195,
          286,
          { align: "right" }
        );
      }

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