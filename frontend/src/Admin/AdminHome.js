import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import "./AdminHome.css";
import { Bar, Pie } from "react-chartjs-2"; // Import both Bar and Pie charts
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminHome = () => {
  const navigate = useNavigate();
  const [userTypeCount, setUserTypeCount] = useState({ users: 0, admins: 0 });
  const [activationStatusCount, setActivationStatusCount] = useState({ activated: 0, deactivated: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/userDashboard");

        // Count users by type
        const userCount = response.data.users.filter(user => user.userType === "user").length;
        const adminCount = response.data.users.filter(user => user.userType === "admin").length;

        setUserTypeCount({ users: userCount, admins: adminCount });

        // Get counts for activated and deactivated users
        setActivationStatusCount({
          activated: response.data.activatedCount,
          deactivated: response.data.deactivatedCount,
        });

      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  // Chart Data for User Types (Bar Chart)
  const userTypeChartData = {
    labels: ["Users", "Admins"],
    datasets: [
      {
        label: "User Count",
        data: [userTypeCount.users, userTypeCount.admins],
        backgroundColor: ["#4B0082", "#FFA500"],
      },
    ],
  };

  // Chart Data for Activation Status (Pie Chart)
  const activationStatusChartData = {
    labels: ["Activated", "Deactivated"],
    datasets: [
      {
        label: "Activation Status",
        data: [activationStatusCount.activated, activationStatusCount.deactivated],
        backgroundColor: ["#28a745", "#dc3545"],
        hoverOffset: 4, // Optional to add a slight hover effect
      },
    ],
  };

  return (
    <div className="admin-home-container">
      <Navbar />

      <div className="admin-dashboard">
        {/* Landscape Layout: Aligning the charts horizontally */}
        <div className="charts-container">
          <div className="chart-item">
            <h3>User Type Statistics</h3>
            <Bar
              data={userTypeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    enabled: true,
                  },
                  legend: {
                    position: 'top',
                  },
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    grid: {
                      color: '#f2f2f2',
                    },
                  },
                  y: {
                    beginAtZero: true,
                    grid: {
                      color: '#f2f2f2',
                    },
                  },
                },
              }}
            />
          </div>

          <div className="chart-item">
            <h3>Activation Status</h3>
            <Pie
              data={activationStatusChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    enabled: true,
                  },
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
