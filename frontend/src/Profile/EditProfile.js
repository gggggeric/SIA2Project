import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPen } from "react-icons/fa"; // Import the pencil icon from react-icons
import styles from "./EditProfile.module.css"; // Import CSS Module

const EditProfile = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [password, setPassword] = useState(""); // State for password
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility

  // Get userId from localStorage
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
        // Email is fetched but not set in state to prevent modification
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setName(value);
    } else if (name === "address") {
      setAddress(value);
    } else if (name === "password") {
      setPassword(value); // Update password state
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
      toast.error("Please select a profile image to upload.");
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

      setShowModal(false); // Close the modal after successful update
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

    // Prepare the data object
    const updatedData = { name, address, password };

    // Filter out empty fields (don't update if they are empty)
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

      // Update state with the latest data
      setName(response.data.updatedUser.name);
      setAddress(response.data.updatedUser.address);
      setPassword(""); // Clear password field after update
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
      <ToastContainer />
      <div className={styles.contentContainer}>
        <div className={styles.container}>
          <Navbar /> {/* Include the Navbar here */}
          <h2 className={styles.title}>Edit Profile</h2>

          <div className={styles.groupBox}>
            {/* Display User's Name and Profile Image */}
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
                  </div> // Fallback to first letter if no profile image
                )}
                {/* Pencil icon inside profile image */}
                <div
                  className={styles.editIcon}
                  onClick={() => setShowModal(true)}
                >
                  <FaPen />
                </div>
              </div>
              <div className={styles.userName}>
                <h3>{name}</h3>
                {/* Email is displayed but not editable */}
                <p className={styles.userEmail}>
                  {localStorage.getItem("email")}
                </p>
              </div>
            </div>
          </div>

          {/* Textboxes below profile image for updating name, address, and password */}
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
        </div>

        {/* Modal for updating only the profile image */}
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

              {/* Show current profile image */}
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