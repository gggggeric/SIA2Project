import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import "./AdminHome.css";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, ChartDataLabels);

const AdminHome = () => {
  const navigate = useNavigate();
  const [userTypeCount, setUserTypeCount] = useState({ users: 0, admins: 0 });
  const [activationStatusCount, setActivationStatusCount] = useState({ activated: 0, deactivated: 0 });
  const [reviewsCount, setReviewsCount] = useState({ anonymous: 0, nonAnonymous: 0 });
  const [diagnosisCounts, setDiagnosisCounts] = useState({ Nearsighted: 0, Farsighted: 0, NormalVision: 0 });
  const [astigmatismCounts, setAstigmatismCounts] = useState({ leftEye: 0, rightEye: 0, bothEyes: 0, noAstigmatism: 0 });
  const [colorBlindnessCounts, setColorBlindnessCounts] = useState({
    normal: 0,
    mild: 0,
    moderate: 0,
    severe: 0,
  });

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

    const fetchDiagnosisCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/diagnosis-counts");
        setDiagnosisCounts(response.data);
      } catch (error) {
        console.error("Error fetching diagnosis counts:", error);
      }
    };

    const fetchAstigmatismCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/astigmatism-chart");
        setAstigmatismCounts(response.data);
      } catch (error) {
        console.error("Error fetching astigmatism counts:", error);
      }
    };

    const fetchColorBlindnessCounts = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/color-blindness-counts");
        setColorBlindnessCounts(response.data);
      } catch (error) {
        console.error("Error fetching color blindness counts:", error);
      }
    };

    fetchUsers();
    fetchReviews();
    fetchDiagnosisCounts();
    fetchAstigmatismCounts();
    fetchColorBlindnessCounts();
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

  // Chart Data for Diagnosis Distribution (Bar Chart)
  const diagnosisChartData = {
    labels: ["Nearsighted", "Farsighted", "Normal Vision"],
    datasets: [
      {
        label: "Diagnosis Count",
        data: [diagnosisCounts.Nearsighted, diagnosisCounts.Farsighted, diagnosisCounts.NormalVision],
        backgroundColor: ["#FF6384", "#36A2EB", "#4BC0C0"],
        borderColor: ["#FF6384", "#36A2EB", "#4BC0C0"],
        borderWidth: 2,
        hoverBackgroundColor: ["#FF4D6A", "#2D8ACB", "#3BA6A6"],
      },
    ],
  };

  // Chart Data for Astigmatism Distribution (Bar Chart)
  const astigmatismChartData = {
    labels: ["Left Eye", "Right Eye", "Both Eyes", "No Astigmatism"],
    datasets: [
      {
        label: "Astigmatism Count",
        data: [astigmatismCounts.leftEye, astigmatismCounts.rightEye, astigmatismCounts.bothEyes, astigmatismCounts.noAstigmatism],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        borderWidth: 2,
        hoverBackgroundColor: ["#FF4D6A", "#2D8ACB", "#FFB732", "#3BA6A6"],
      },
    ],
  };

  // Chart Data for Color Blindness Distribution (Bar Chart)
  const colorBlindnessChartData = {
    labels: ["Normal Vision", "Mild Color Blindness", "Moderate Color Blindness", "Severe Color Blindness"],
    datasets: [
      {
        label: "Color Blindness Count",
        data: [
          colorBlindnessCounts.normal,
          colorBlindnessCounts.mild,
          colorBlindnessCounts.moderate,
          colorBlindnessCounts.severe,
        ],
        backgroundColor: ["#4BC0C0", "#36A2EB", "#FFCE56", "#FF6384"],
        borderColor: ["#4BC0C0", "#36A2EB", "#FFCE56", "#FF6384"],
        borderWidth: 2,
        hoverBackgroundColor: ["#3BA6A6", "#2D8ACB", "#FFB732", "#FF4D6A"],
      },
    ],
  };

  return (
    <div className="admin-home-container">
      <Navbar />

      <div className="admin-dashboard">
        <h2 className="dashboard-title">Admin Dashboard</h2>
        <div className="charts-container">
          {/* First Row: Existing Charts */}
          <div className="chart-row">
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

          {/* Second Row: Diagnosis, Astigmatism, and Color Blindness Charts */}
          <div className="chart-row">
            <div className="chart-item full-width">
              <h3>Diagnosis Distribution</h3>
              <Bar
                data={diagnosisChartData}
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

            <div className="chart-item full-width">
              <h3>Astigmatism Distribution</h3>
              <Bar
                data={astigmatismChartData}
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

            <div className="chart-item full-width">
              <h3>Color Blindness Distribution</h3>
              <Bar
                data={colorBlindnessChartData}
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
    </div>
  );
};

export default AdminHome;