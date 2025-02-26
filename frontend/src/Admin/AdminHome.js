import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import "./AdminHome.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("email"); // Get admin email
  const [userTypeCount, setUserTypeCount] = useState({ users: 0, admins: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/users/userDashboard");

        // Count users by type
        const userCount = response.data.filter(user => user.userType === "user").length;
        const adminCount = response.data.filter(user => user.userType === "admin").length;

        setUserTypeCount({ users: userCount, admins: adminCount });
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

 

  // Chart Data
  const chartData = {
    labels: ["Users", "Admins"],
    datasets: [
      {
        label: "User Count",
        data: [userTypeCount.users, userTypeCount.admins],
        backgroundColor: ["#4B0082", "#FFA500"],
      },
    ],
  };

  return (
    <div className="admin-home-container">
      <Navbar />

      <div className="admin-dashboard">
        <h2 className="welcome-text">Welcome, {email || "Admin"}!</h2>
        <p className="subtext">Monitor statistics and manage the system efficiently.</p>

        <div className="admin-statistics">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p>{userTypeCount.users}</p>
          </div>
          <div className="stat-card">
            <h3>Total Admins</h3>
            <p>{userTypeCount.admins}</p>
          </div>
        </div>

        {/* User Statistics Chart */}
        <div className="chart-container">
          <h3>User Statistics</h3>
          <Bar data={chartData} />
        </div>

        <div className="admin-buttons">
          <button onClick={() => navigate("/adminUserCRUD")} className="admin-btn">
            Manage Users
          </button>
          <button onClick={() => navigate("/view-reports")} className="admin-btn">
            View Reports
          </button>
          <button onClick={() => navigate("/settings")} className="admin-btn">
            Settings
          </button>

        </div>
      </div>
    </div>
  );
};

export default AdminHome;
