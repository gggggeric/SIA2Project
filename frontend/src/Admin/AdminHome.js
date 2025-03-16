import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import "./AdminHome.css";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import tuplogo from "../assets/tuplogo.png"; // Import the logo

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
        const userCount = response.data.users.filter((user) => user.userType === "user").length;
        const adminCount = response.data.users.filter((user) => user.userType === "admin").length;
        setUserTypeCount({ users: userCount, admins: adminCount });
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

  // Function to export a single chart as PDF
  const exportChartToPDF = (chartId, chartTitle, chartDescription, summaryAndAnalysis) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error("Chart element not found!");
      return;
    }

    html2canvas(chartElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF();

      // Convert the logo to a data URL
      const img = new Image();
      img.src = tuplogo;
      img.onload = () => {
        const logoCanvas = document.createElement("canvas");
        logoCanvas.width = img.width;
        logoCanvas.height = img.height;
        const ctx = logoCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const logoDataUrl = logoCanvas.toDataURL("image/png");

        // Add the logo
        doc.addImage(logoDataUrl, "PNG", 10, 10, 30, 30);

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

        // Chart Title (Centered)
        doc.setFontSize(14).setFont("helvetica", "bold");
        const chartTitleWidth = doc.getTextWidth(chartTitle);
        const chartTitleX = (doc.internal.pageSize.getWidth() - chartTitleWidth) / 2; // Center the title
        doc.text(chartTitle, chartTitleX, 110);

        // Add the description (Centered)
        doc.setFontSize(12).setFont("helvetica", "normal");
        doc.setTextColor(50, 50, 50); // Dark gray text
        const descriptionLines = doc.splitTextToSize(chartDescription, 180); // Wrap text to fit width
        const descriptionX = (doc.internal.pageSize.getWidth() - 180) / 2; // Center the description
        doc.text(descriptionLines, descriptionX, 120); // Position below the chart title

        // Add the chart image (Centered)
        const imgWidth = 150; // Adjusted width for smaller image
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const chartX = (doc.internal.pageSize.getWidth() - imgWidth) / 2; // Center the chart
        const chartY = 120 + descriptionLines.length * 5 + 10; // Position below the description
        doc.addImage(imgData, "PNG", chartX, chartY, imgWidth, imgHeight);

        // Add Summary and Analysis (Centered)
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text("Summary and Analysis:", descriptionX, chartY + imgHeight + 15); // Position below the chart
        doc.setFontSize(12).setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(summaryAndAnalysis, 180); // Wrap text to fit width
        doc.text(summaryLines, descriptionX, chartY + imgHeight + 25); // Position below the summary title

        // Footer
        doc.setFontSize(10).setFont("helvetica", "italic");
        doc.text("Generated by Optic AI - Vision Testing System", 10, 280);

        // Save the PDF
        doc.save(`${chartTitle.replace(/ /g, "_")}.pdf`);
      };
    });
  };

  // Function to export all charts as a single PDF
  const exportAllChartsToPDF = async () => {
    const doc = new jsPDF();
  
    // Convert the logo to a data URL
    const img = new Image();
    img.src = tuplogo;
    img.onload = async () => {
      const logoCanvas = document.createElement("canvas");
      logoCanvas.width = img.width;
      logoCanvas.height = img.height;
      const ctx = logoCanvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const logoDataUrl = logoCanvas.toDataURL("image/png");
  
      // Add the logo
      doc.addImage(logoDataUrl, "PNG", 10, 10, 30, 30);
  
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
  
      // Add all charts to the PDF
      const chartIds = [
        "userTypeChart",
        "activationStatusChart",
        "reviewsChart",
        "diagnosisChart",
        "astigmatismChart",
        "colorBlindnessChart",
      ];
  
      let currentY = 110; // Starting Y position for the first chart
  
      for (const chartId of chartIds) {
        const chartElement = document.getElementById(chartId);
        if (!chartElement) {
          console.error(`Chart element ${chartId} not found!`);
          continue;
        }
  
        // Increase the DPI for better quality
        const canvas = await html2canvas(chartElement, { scale: 2 }); // Scale up for HD
        const imgData = canvas.toDataURL("image/png");
  
        // Add the chart title
        const chartTitle = chartElement.parentElement.querySelector("h3").innerText;
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text(chartTitle, 10, currentY);
  
        // Add the chart image (smaller size)
        const imgWidth = 120; // Smaller width for charts
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, "PNG", 10, currentY + 10, imgWidth, imgHeight);
  
        // Update the Y position for the next chart
        currentY += imgHeight + 30; // Add extra spacing between charts
  
        // Add a new page if necessary
        if (currentY > 250) {
          doc.addPage();
          currentY = 20; // Reset Y position for the new page
        }
      }
  
      // Add a new page for the Overall Summary and Analysis
      doc.addPage();
      currentY = 20; // Reset Y position for the new page
  
      // Add Overall Summary and Analysis
      doc.setFontSize(14).setFont("helvetica", "bold");
      doc.text("Overall Summary and Analysis", 10, currentY);
  
      const overallSummary = `
        **Summary:**
  
        - **User Types:** The system currently has ${userTypeCount.users} regular users and ${userTypeCount.admins} administrators. This indicates a healthy user base with a smaller number of administrators managing the system.
  
        - **Activation Status:** Out of the total accounts, ${activationStatusCount.activated} are activated, while ${activationStatusCount.deactivated} are deactivated. This suggests that most users are actively using the system, while the deactivated accounts may represent inactive or banned users.
  
        - **Reviews:** There are ${reviewsCount.anonymous} anonymous reviews and ${reviewsCount.nonAnonymous} non-anonymous reviews. The higher number of anonymous reviews suggests that users prefer to remain anonymous when providing feedback, possibly due to privacy concerns.
  
        - **Diagnosis:** The diagnosis distribution shows ${diagnosisCounts.Nearsighted} users with nearsightedness, ${diagnosisCounts.Farsighted} with farsightedness, and ${diagnosisCounts.NormalVision} with normal vision. This highlights the importance of vision testing and corrective measures, as a significant number of users experience vision issues.
  
        - **Astigmatism:** The astigmatism distribution reveals ${astigmatismCounts.leftEye} cases in the left eye, ${astigmatismCounts.rightEye} in the right eye, ${astigmatismCounts.bothEyes} in both eyes, and ${astigmatismCounts.noAstigmatism} with no astigmatism. This data underscores the need for regular eye examinations, as astigmatism is relatively common.
  
        - **Color Blindness:** The color blindness distribution shows ${colorBlindnessCounts.normal} users with normal vision, ${colorBlindnessCounts.mild} with mild color blindness, ${colorBlindnessCounts.moderate} with moderate color blindness, and ${colorBlindnessCounts.severe} with severe color blindness. This emphasizes the importance of accessibility considerations in design and user interfaces.
  
        **Analysis:**
  
        - The majority of users are regular users, indicating a healthy and active user base. The smaller number of administrators suggests efficient system management.
  
        - Most accounts are activated, which reflects active usage of the system. The deactivated accounts may represent users who are no longer active or have been banned.
  
        - Anonymous reviews are more common, which could indicate that users prefer to provide feedback without revealing their identity. This may be due to privacy concerns or a desire to remain anonymous.
  
        - Normal vision is the most common diagnosis, but a significant number of users experience nearsightedness and farsightedness. This highlights the importance of regular vision testing and corrective measures.
  
        - Astigmatism is relatively common, with many users experiencing it in one or both eyes. This underscores the need for regular eye examinations and corrective measures.
  
        - A notable percentage of users experience some form of color blindness, which highlights the importance of accessibility considerations in design and user interfaces. Ensuring that the system is accessible to all users, including those with color blindness, is crucial for inclusivity.
      `;
  
      doc.setFontSize(12).setFont("helvetica", "normal");
      const summaryLines = doc.splitTextToSize(overallSummary, 180); // Wrap text to fit width
      doc.text(summaryLines, 10, currentY + 10);
  
      // Footer
      doc.setFontSize(10).setFont("helvetica", "italic");
      doc.text("Generated by Optic AI - Vision Testing System", 10, 280);
  
      // Watermark
      doc.setFontSize(40).setFont("helvetica", "bold");
      doc.setTextColor(230, 230, 230); // Light gray text
      doc.text("Optic AI", 50, 150, { angle: 45 });
  
      // Save the PDF
      doc.save("All_Charts_Report.pdf");
    };
  };
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
        data: [colorBlindnessCounts.normal || 0, colorBlindnessCounts.mild || 0, colorBlindnessCounts.moderate || 0, colorBlindnessCounts.severe || 0],
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
        <button onClick={exportAllChartsToPDF} className="export-all-button">
          Export All Charts
        </button>
        <div className="charts-container">
          {/* First Row: Existing Charts */}
          <div className="chart-row">
            <div className="chart-item">
              <h3>User Type Statistics</h3>
              <div id="userTypeChart" className="chart-container">
                <Bar data={userTypeChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This chart displays the distribution of user types, distinguishing between regular users and administrators.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "userTypeChart",
                    "User Type Statistics",
                    "This chart displays the distribution of user types, distinguishing between regular users and administrators.",
                    `**Summary:** The chart shows that there are ${userTypeCount.users} regular users and ${userTypeCount.admins} administrators.
                    **Analysis:** The majority of users are regular users, indicating a healthy user base with a smaller number of administrators managing the system.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>

            <div className="chart-item">
              <h3>Activation Status</h3>
              <div id="activationStatusChart" className="chart-container pie-chart-container">
                <Pie data={activationStatusChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This pie chart illustrates the proportion of activated versus deactivated user accounts.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "activationStatusChart",
                    "Activation Status",
                    "This pie chart illustrates the proportion of activated versus deactivated user accounts.",
                    `**Summary:** The chart shows that ${activationStatusCount.activated} accounts are activated and ${activationStatusCount.deactivated} accounts are deactivated.
                    **Analysis:** The high number of activated accounts suggests that most users are actively using the system, while the deactivated accounts may represent inactive or banned users.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>

            <div className="chart-item">
              <h3>Reviews Statistics</h3>
              <div id="reviewsChart" className="chart-container">
                <Bar data={reviewsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This bar chart shows the number of anonymous versus non-anonymous reviews submitted by users.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "reviewsChart",
                    "Reviews Statistics",
                    "This bar chart shows the number of anonymous versus non-anonymous reviews submitted by users.",
                    `**Summary:** The chart indicates that there are ${reviewsCount.anonymous} anonymous reviews and ${reviewsCount.nonAnonymous} non-anonymous reviews.
                    **Analysis:** The higher number of anonymous reviews suggests that users prefer to remain anonymous when providing feedback, possibly due to privacy concerns.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>
          </div>

          {/* Second Row: Diagnosis, Astigmatism, and Color Blindness Charts */}
          <div className="chart-row">
            <div className="chart-item full-width">
              <h3>Diagnosis Distribution</h3>
              <div id="diagnosisChart" className="chart-container">
                <Bar data={diagnosisChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This chart provides an overview of the diagnosis distribution, including nearsightedness, farsightedness, and normal vision.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "diagnosisChart",
                    "Diagnosis Distribution",
                    "This chart provides an overview of the diagnosis distribution, including nearsightedness, farsightedness, and normal vision.",
                    `**Summary:** The chart shows that ${diagnosisCounts.Nearsighted} users are nearsighted, ${diagnosisCounts.Farsighted} are farsighted, and ${diagnosisCounts.NormalVision} have normal vision.
                    **Analysis:** The majority of users have normal vision, with a significant number of users experiencing nearsightedness and farsightedness. This highlights the importance of vision testing and corrective measures.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>

            <div className="chart-item full-width">
              <h3>Astigmatism Distribution</h3>
              <div id="astigmatismChart" className="chart-container">
                <Bar data={astigmatismChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This chart details the distribution of astigmatism cases, categorized by left eye, right eye, both eyes, and no astigmatism.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "astigmatismChart",
                    "Astigmatism Distribution",
                    "This chart details the distribution of astigmatism cases, categorized by left eye, right eye, both eyes, and no astigmatism.",
                    `**Summary:** The chart indicates that ${astigmatismCounts.leftEye} users have astigmatism in the left eye, ${astigmatismCounts.rightEye} in the right eye, ${astigmatismCounts.bothEyes} in both eyes, and ${astigmatismCounts.noAstigmatism} have no astigmatism.
                    **Analysis:** The data shows that astigmatism is relatively common, with a significant number of users experiencing it in one or both eyes. This underscores the need for regular eye examinations.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>

            <div className="chart-item full-width">
              <h3>Color Blindness Distribution</h3>
              <div id="colorBlindnessChart" className="chart-container">
                <Bar data={colorBlindnessChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This chart illustrates the distribution of color blindness cases, ranging from normal vision to severe color blindness.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "colorBlindnessChart",
                    "Color Blindness Distribution",
                    "This chart illustrates the distribution of color blindness cases, ranging from normal vision to severe color blindness.",
                    `**Summary:** The chart shows that ${colorBlindnessCounts.normal} users have normal vision, ${colorBlindnessCounts.mild} have mild color blindness, ${colorBlindnessCounts.moderate} have moderate color blindness, and ${colorBlindnessCounts.severe} have severe color blindness.
                    **Analysis:** The majority of users have normal vision, but a notable percentage experience some form of color blindness. This highlights the importance of accessibility considerations in design and user interfaces.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;