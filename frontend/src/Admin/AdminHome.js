import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import "./AdminHome.css";
import { Bar, Pie } from "react-chartjs-2"; // Import both Bar and Pie charts
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels"; // Import the datalabels plugin

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const AdminHome = () => {
  const navigate = useNavigate();
  const [userTypeCount, setUserTypeCount] = useState({ users: 0, admins: 0 });
  const [activationStatusCount, setActivationStatusCount] = useState({ activated: 0, deactivated: 0 });
  const [reviewsCount, setReviewsCount] = useState({ anonymous: 0, nonAnonymous: 0 });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/userDashboard");

        // Count users by type
        const userCount = response.data.users.filter((user) => user.userType === "user").length;
        const adminCount = response.data.users.filter((user) => user.userType === "admin").length;

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

    const fetchReviews = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/reviewsDashboard");
        setReviewsCount({
          anonymous: response.data.anonymousCount,
          nonAnonymous: response.data.nonAnonymousCount,
        });
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchUsers();
    fetchReviews();
  }, []);

  // Chart Data for User Types (Bar Chart)
  const userTypeChartData = {
    labels: ["Users", "Admins"],
    datasets: [
      {
        label: "User Count",
        data: [userTypeCount.users, userTypeCount.admins],
        backgroundColor: ["#4B0082", "#FFA500"],
        borderColor: ["#4B0082", "#FFA500"],
        borderWidth: 2,
        hoverBackgroundColor: ["#3A006B", "#CC8400"],
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
        borderColor: ["#28a745", "#dc3545"],
        borderWidth: 2,
        hoverBackgroundColor: ["#1E7E34", "#A71D2A"],
      },
    ],
  };

  // Chart Data for Reviews (Bar Chart)
  const reviewsChartData = {
    labels: ["Anonymous", "Non-Anonymous"],
    datasets: [
      {
        label: "Review Count",
        data: [reviewsCount.anonymous, reviewsCount.nonAnonymous],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#FF6384", "#36A2EB"],
        borderWidth: 2,
        hoverBackgroundColor: ["#FF4D6A", "#2D8ACB"],
      },
    ],
  };

  return (
    <div className="admin-home-container">
      <Navbar />

      <div className="admin-dashboard">
        <h2 className="dashboard-title">Admin Dashboard</h2>
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
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleFont: { size: 16 },
                    bodyFont: { size: 14 },
                  },
                  legend: {
                    position: "top",
                    labels: {
                      font: { size: 14 },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 14 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f2f2f2" },
                    ticks: { font: { size: 14 } },
                  },
                },
              }}
            />
          </div>

          <div className="chart-item">
            <h3>Activation Status</h3>
            <div className="pie-chart-container">
              <Pie
                data={activationStatusChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    tooltip: {
                      enabled: true,
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      titleFont: { size: 16 },
                      bodyFont: { size: 14 },
                    },
                    legend: {
                      position: "top",
                      labels: {
                        font: { size: 14 },
                      },
                    },
                    datalabels: {
                      color: "#fff",
                      font: { size: 14, weight: "bold" },
                      formatter: (value) => `${value}%`, // Display percentage
                    },
                  },
                }}
                width={250} // Set a fixed width
                height={250} // Set a fixed height
              />
            </div>
          </div>

          <div className="chart-item">
            <h3>Reviews Statistics</h3>
            <Bar
              data={reviewsChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    titleFont: { size: 16 },
                    bodyFont: { size: 14 },
                  },
                  legend: {
                    position: "top",
                    labels: {
                      font: { size: 14 },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { font: { size: 14 } },
                  },
                  y: {
                    beginAtZero: true,
                    grid: { color: "#f2f2f2" },
                    ticks: { font: { size: 14 } },
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