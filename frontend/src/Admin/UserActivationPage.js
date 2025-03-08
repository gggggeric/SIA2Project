import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navigation/Navbar"; // Make sure the path to Navbar is correct
import "./UserActivationPage.css"; // Scoped CSS
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UserActivationPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from the backend
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/manageActive");
        setUsers(response.data.users); // Assuming response contains a "users" array
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const toggleUserActivation = async (userId, currentStatus) => {
    try {
      const updatedStatus = currentStatus === "Activated" ? "Deactivated" : "Activated"; // Toggle between "Activated" and "Deactivated"
      
      const response = await axios.put(`http://localhost:5001/admin/user/${userId}/activate`, {
        isActivate: updatedStatus, // Send the updated activation status
      });

      // Update the user status in the local state
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isActivate: updatedStatus } : user
      ));

      // Show success toast with custom design
      toast.success(response.data.message, {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      // Show error toast with custom design
      toast.error("Failed to update user status.", {
        position: 'bottom-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
    }
  };

  return (
    <div className="user-activation-page">
      <Navbar /> {/* Include the Navbar here */}

      <div className="user-activation-page__content">
        {/* Table section */}
        <div className="user-activation-page__table-section">
          <h2 className="user-activation-page__title">User Activation Management</h2>
          <table className="user-activation-page__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.isActivate === "Activated" ? "Active" : "Deactivated"}</td>
                  <td>
                    <button
                      onClick={() => toggleUserActivation(user._id, user.isActivate)}
                      className={`user-activation-page__btn ${user.isActivate === "Activated" ? "user-activation-page__deactivate-btn" : "user-activation-page__activate-btn"}`}
                    >
                      {user.isActivate === "Activated" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ToastContainer will render the toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default UserActivationPage;
