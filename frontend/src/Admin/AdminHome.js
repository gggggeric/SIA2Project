import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navigation/Navbar";
import "./AdminHome.css";
import { Bar, Pie, Line, Doughnut, Radar, PolarArea } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import tuplogo from "../assets/tuplogo.png"; // Import the logo

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

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
  const [genderData, setGenderData] = useState({ male: 0, female: 0, other: 0 }); // Add gender data state
  const [reviews, setReviews] = useState([]); // Initialize reviews as an empty array
  const [sentimentResults, setSentimentResults] = useState({ positive: 0, neutral: 0, negative: 0 }); // State for sentiment analysis results

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
        console.log("Backend Response:", response.data); // Log the entire response

        setReviewsCount({
          anonymous: response.data.anonymousCount,
          nonAnonymous: response.data.nonAnonymousCount,
        });
        setReviews(response.data.reviews || []); // Ensure reviews is an array
        setSentimentResults(response.data.sentiment || { positive: 0, neutral: 0, negative: 0 }); // Set sentiment results
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

    const fetchGenderData = async () => {
      try {
        const response = await axios.get("http://localhost:5001/admin/gender-distribution");
        setGenderData(response.data.data); // Assuming the response is { male: X, female: Y, other: Z }
      } catch (error) {
        console.error("Error fetching gender data:", error);
      }
    };

    fetchUsers();
    fetchReviews();
    fetchDiagnosisCounts();
    fetchAstigmatismCounts();
    fetchColorBlindnessCounts();
    fetchGenderData(); // Fetch gender data
  }, []);

  // Function to export a single chart as PDF
  const exportChartToPDF = (chartId, chartTitle, chartDescription, summaryAndAnalysis) => {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.error("Chart element not found!");
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
      title: `${chartTitle} - Optic AI Report`,
      subject: "Chart Analysis",
      author: "TUP-Taguig",
      creator: "Optic AI",
    });

    // Generate high-quality chart image
    html2canvas(chartElement, { scale: 3 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");

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

        // ===== HEADER SECTION =====
        // Add the logo
        doc.addImage(logoDataUrl, "PNG", 15, 15, 25, 25);

        // Add header text with right alignment
        doc.setFontSize(16).setFont("helvetica", "bold");
        doc.text("Technological University of the Philippines - Taguig", 195, 20, { align: "right" });

        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text("Optic AI - Vision Testing System", 195, 28, { align: "right" });

        // Add date with right alignment
        const today = new Date();
        doc.setFontSize(10).setFont("helvetica", "normal");
        doc.text(`Report Date: ${today.toLocaleDateString()}`, 195, 35, { align: "right" });

        // Add decorative header line
        doc.setDrawColor(204, 0, 0); // Red line
        doc.setLineWidth(0.8);
        doc.line(15, 42, 195, 42);

        // ===== TEAM MEMBERS SECTION =====
        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.text("Team Members:", 15, 50);

        doc.setFontSize(11).setFont("helvetica", "normal");
        const teamMembers = ["Morit Geric T.", "Bacala Nicole", "Gone Krizel", "Giana Mico"];

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
        doc.setDrawColor(204, 0, 0); // Red line
        doc.setLineWidth(0.3);
        doc.line(15, 75, 195, 75);

        // ===== CHART TITLE SECTION =====
        // Add chart title with decorative line
        doc.setFontSize(14).setFont("helvetica", "bold");
        doc.text(chartTitle, 15, 85);

        doc.setDrawColor(204, 0, 0); // Red line under title
        doc.setLineWidth(0.5);
        doc.line(15, 87, 80, 87);

        // ===== DESCRIPTION SECTION =====
        // Add the description with proper formatting
        doc.setFontSize(11).setFont("helvetica", "italic");
        doc.setTextColor(60, 60, 60); // Dark gray text
        const descriptionLines = doc.splitTextToSize(chartDescription, 170); // Wrap text to fit width
        doc.text(descriptionLines, 15, 95);

        // Calculate vertical position after description
        const descriptionHeight = descriptionLines.length * 5;
        let currentY = 95 + descriptionHeight + 8;

        // ===== CHART IMAGE SECTION =====
        // Add the chart image (centered with border)
        const imgWidth = 160; // Width for chart
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const chartX = (210 - imgWidth) / 2; // Center the chart

        // Add light gray background for chart
        doc.setFillColor(248, 248, 248); // Very light gray
        doc.roundedRect(chartX - 2, currentY - 2, imgWidth + 4, imgHeight + 4, 1, 1, "F");

        // Add subtle border around chart
        doc.setDrawColor(200, 200, 200); // Light gray border
        doc.setLineWidth(0.3);
        doc.roundedRect(chartX - 2, currentY - 2, imgWidth + 4, imgHeight + 4, 1, 1, "S");

        // Add the chart image
        doc.addImage(imgData, "PNG", chartX, currentY, imgWidth, imgHeight);

        // Update Y position for the summary section
        currentY += imgHeight + 15;

        // ===== SUMMARY & ANALYSIS SECTION =====
        // Create a highlighted heading for summary
        doc.setFillColor(240, 240, 240); // Light gray background
        doc.roundedRect(15, currentY, 180, 8, 1, 1, "F");

        doc.setDrawColor(204, 0, 0); // Red line
        doc.setLineWidth(0.3);
        doc.roundedRect(15, currentY, 180, 8, 1, 1, "S");

        doc.setFontSize(12).setFont("helvetica", "bold");
        doc.setTextColor(204, 0, 0); // Red text
        doc.text("Summary and Analysis", 105, currentY + 5.5, { align: "center" });
        doc.setTextColor(0); // Reset to black

        // Add the summary text
        currentY += 12;
        doc.setFontSize(11).setFont("helvetica", "normal");
        const summaryLines = doc.splitTextToSize(summaryAndAnalysis, 175);
        doc.text(summaryLines, 15, currentY);

        // ===== FOOTER SECTION =====
        // Add decorative footer line
        doc.setDrawColor(204, 0, 0); // Red line
        doc.setLineWidth(0.5);
        doc.line(15, 280, 195, 280);

        // Add footer text with date and time
        doc.setFontSize(8).setFont("helvetica", "italic");
        doc.text("Generated by Optic AI - Vision Testing System", 15, 286);

        doc.setFontSize(8).setFont("helvetica", "normal");
        doc.text(`Generated on: ${today.toLocaleDateString()} at ${today.toLocaleTimeString()}`, 195, 286, { align: "right" });

        // Save the PDF with a clean filename
        const cleanFileName = chartTitle.replace(/[^\w\s]/gi, "").replace(/\s+/g, "_");
        doc.save(`${cleanFileName}_Report.pdf`);
      };
    });
  };

 // Function to export all charts as a single PDF
const exportAllChartsToPDF = async () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set document properties
  doc.setProperties({
    title: "Optic AI - Vision Testing System Report",
    subject: "Analytics Report",
    author: "TUP-Taguig",
    creator: "Optic AI",
  });

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

    // ===== HEADER SECTION =====
    // Add the logo
    doc.addImage(logoDataUrl, "PNG", 15, 15, 25, 25);

    // Add header text with right alignment
    doc.setFontSize(16).setFont("helvetica", "bold");
    doc.setTextColor(204, 0, 0); // Red color for main header
    doc.text("Technological University of the Philippines - Taguig", 195, 20, { align: "right" });

    doc.setFontSize(14).setFont("helvetica", "bold");
    doc.text("Optic AI - Vision Testing System", 195, 28, { align: "right" });

    // Add date with right alignment
    const today = new Date();
    doc.setFontSize(10).setFont("helvetica", "normal");
    doc.setTextColor(0); // Reset to black for normal text
    doc.text(`Report Date: ${today.toLocaleDateString()}`, 195, 35, { align: "right" });

    // Add decorative header line
    doc.setDrawColor(204, 0, 0); // Red line
    doc.setLineWidth(0.8);
    doc.line(15, 42, 195, 42);

    // ===== TEAM MEMBERS SECTION =====
    doc.setFontSize(12).setFont("helvetica", "bold");
    doc.setTextColor(0); // Black color for "Team Members:"
    doc.text("Team Members:", 15, 50);

    doc.setFontSize(11).setFont("helvetica", "normal");
    doc.setTextColor(0); // Reset to black for normal text
    const teamMembers = ["Morit Geric T.", "Bacala Nicole", "Gone Krizel", "Giana Mico"];

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
    doc.setDrawColor(204, 0, 0); // Red for divider
    doc.setLineWidth(0.3);
    doc.line(15, 75, 195, 75);

    // ===== CHARTS SECTION =====
    const chartIds = [
      "userTypeChart",
      "activationStatusChart",
      "reviewsChart",
      "diagnosisChart",
      "astigmatismChart",
      "colorBlindnessChart",
      "sentimentDonutChart",
      "genderChart", // Add gender chart
    ];

    let currentY = 85; // Starting Y position for the first chart
    let chartCount = 0;

    for (const chartId of chartIds) {
      const chartElement = document.getElementById(chartId);
      if (!chartElement) {
        console.error(`Chart element ${chartId} not found!`);
        continue;
      }

      // Add a new page if necessary (after 2 charts)
      if (chartCount > 0 && chartCount % 2 === 0) {
        doc.addPage();
        currentY = 25; // Reset Y position for the new page
      }

      // Increase the DPI for better quality
      const canvas = await html2canvas(chartElement, { scale: 3 }); // Higher scale for better quality
      const imgData = canvas.toDataURL("image/png");

      // Add chart title with decorative line
      const chartTitle = chartElement.parentElement.querySelector("h3").innerText;
      doc.setFontSize(13).setFont("helvetica", "bold");
      doc.setTextColor(0); // Black color for chart titles
      doc.text(chartTitle, 15, currentY);

      doc.setDrawColor(204, 0, 0); // Red line under title
      doc.setLineWidth(0.5);
      doc.line(15, currentY + 2, 80, currentY + 2);

      doc.setTextColor(0); // Reset to black for normal text

      // For sentiment chart, adjust dimensions to fit the PDF
      if (chartId === "sentimentDonutChart") {
        const imgWidth = 300; // Adjusted width for better fit
        const imgHeight = 80; // Adjusted height for better fit

        const canvas = await html2canvas(chartElement, { scale: 3 }); // Higher scale for better quality
        const imgData = canvas.toDataURL("image/png");

        const centerX = (210 - imgWidth) / 2; // Center the chart horizontally
        doc.addImage(imgData, "PNG", centerX, currentY + 6, imgWidth, imgHeight);

        currentY += imgHeight + 20; // Extra spacing for better layout
      } else {
        // For other charts, use proportional dimensions
        const imgWidth = 160;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const centerX = (210 - imgWidth) / 2;
        doc.addImage(imgData, "PNG", centerX, currentY + 6, imgWidth, imgHeight);

        // Update the Y position for the next chart
        currentY += imgHeight + 25;
      }

      chartCount++;
    }

    // ===== SUMMARY PAGE =====
    doc.addPage();

    // Add summary title with decorative elements
    doc.setFillColor(204, 0, 0); // Red background
    doc.rect(15, 15, 180, 10, "F");
    doc.setTextColor(255); // White text on red background
    doc.setFontSize(14).setFont("helvetica", "bold");
    doc.text("OVERALL SUMMARY AND ANALYSIS", 105, 22, { align: "center" });
    doc.setTextColor(0); // Reset to black

    let summaryY = 35;

    // Summary sections with better formatting
    const sections = [
      {
        title: "User Types",
        content: `The system currently has ${userTypeCount.users} regular users and ${userTypeCount.admins} administrators. This indicates a healthy user base with a smaller number of administrators managing the system.`,
      },
      {
        title: "Activation Status",
        content: `Out of the total accounts, ${activationStatusCount.activated} are activated, while ${activationStatusCount.deactivated} are deactivated. This suggests that most users are actively using the system.`,
      },
      {
        title: "Reviews",
        content: `There are ${reviewsCount.anonymous} anonymous reviews and ${reviewsCount.nonAnonymous} non-anonymous reviews. The higher number of anonymous reviews suggests users prefer to remain anonymous when providing feedback.`,
      },
      {
        title: "Diagnosis",
        content: `The diagnosis distribution shows ${diagnosisCounts.Nearsighted} users with nearsightedness, ${diagnosisCounts.Farsighted} with farsightedness, and ${diagnosisCounts.NormalVision} with normal vision.`,
      },
      {
        title: "Astigmatism",
        content: `The astigmatism distribution reveals ${astigmatismCounts.leftEye} cases in the left eye, ${astigmatismCounts.rightEye} in the right eye, ${astigmatismCounts.bothEyes} in both eyes, and ${astigmatismCounts.noAstigmatism} with no astigmatism.`,
      },
      {
        title: "Color Blindness",
        content: `The color blindness distribution shows ${colorBlindnessCounts.normal} users with normal vision, ${colorBlindnessCounts.mild} with mild color blindness, ${colorBlindnessCounts.moderate} with moderate color blindness, and ${colorBlindnessCounts.severe} with severe color blindness.`,
      },
      {
        title: "Sentiment Analysis",
        content: `The sentiment analysis shows ${sentimentResults.positive} positive, ${sentimentResults.neutral} neutral, and ${sentimentResults.negative} negative sentiments. The majority of sentiments are positive, indicating overall user satisfaction with the system.`,
      },
      {
        title: "Gender Distribution",
        content: `The gender distribution shows ${genderData.male} male users, ${genderData.female} female users, and ${genderData.other} users who identify as other. This indicates a diverse user base with balanced representation.`,
      },
    ];

    // Add each section with nice formatting
    sections.forEach((section) => {
      doc.setFontSize(12).setFont("helvetica", "bold");
      doc.setTextColor(0); // Black for section titles
      doc.text(`• ${section.title}:`, 20, summaryY);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0); // Black for content text
      const contentLines = doc.splitTextToSize(section.content, 170);
      doc.text(contentLines, 25, summaryY + 7);

      summaryY += 7 + contentLines.length * 6 + 5; // Title height + content height + spacing
    });

    // Add analysis title with similar styling
    summaryY += 5;
    doc.setFillColor(204, 0, 0); // Red background
    doc.rect(15, summaryY, 180, 10, "F");
    doc.setTextColor(255); // White text on red background
    doc.setFontSize(14).setFont("helvetica", "bold");
    doc.text("ANALYSIS", 105, summaryY + 7, { align: "center" });
    doc.setTextColor(0); // Reset to black

    summaryY += 20;

    // Analysis text
    doc.setFontSize(11).setFont("helvetica", "normal");
    const analysis = `The data indicates that the Optic AI system is serving a diverse user base with various vision conditions. The majority of users have normal vision, but significant numbers experience vision issues that require attention. The prevalence of astigmatism and color blindness highlights the importance of comprehensive vision testing. The system's user engagement appears healthy with most accounts remaining active. The preference for anonymous reviews suggests users value privacy when providing feedback about their vision health experiences.`;

    const analysisLines = doc.splitTextToSize(analysis, 175);
    doc.text(analysisLines, 15, summaryY);

    // ===== FOOTER SECTION =====
    // Add footer to all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Add decorative footer line
      doc.setDrawColor(204, 0, 0); // Red line
      doc.setLineWidth(0.5);
      doc.line(15, 280, 195, 280);

      // Add footer text
      doc.setFontSize(8).setFont("helvetica", "italic");
      doc.text("Generated by Optic AI - Vision Testing System", 15, 286);

      // Add page numbers
      doc.setFontSize(9).setFont("helvetica", "normal");
      doc.text(`Page ${i} of ${pageCount}`, 195, 286, { align: "right" });
    }

    // Save the PDF
    doc.save("Optic_AI_Vision_Testing_Report.pdf");
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
      },
    ],
  };

  // Chart Data for Reviews (Line Chart)
  const reviewsChartData = {
    labels: ["Anonymous", "Non-Anonymous"],
    datasets: [
      {
        label: "Review Count",
        data: [reviewsCount.anonymous, reviewsCount.nonAnonymous],
        backgroundColor: ["#FF6384", "#36A2EB"],
        borderColor: ["#FF6384", "#36A2EB"],
        borderWidth: 2,
        fill: false, // No fill for line chart
        tension: 0.4, // Smooth line
      },
    ],
  };

  // Chart Data for Diagnosis Distribution (Radar Chart)
  const diagnosisChartData = {
    labels: ["Nearsighted", "Farsighted", "Normal Vision"],
    datasets: [
      {
        label: "Diagnosis Count",
        data: [diagnosisCounts.Nearsighted, diagnosisCounts.Farsighted, diagnosisCounts.NormalVision],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 2,
      },
    ],
  };

  // Chart Data for Astigmatism Distribution (Polar Area Chart)
  const astigmatismChartData = {
    labels: ["Left Eye", "Right Eye", "Both Eyes", "No Astigmatism"],
    datasets: [
      {
        label: "Astigmatism Count",
        data: [astigmatismCounts.leftEye, astigmatismCounts.rightEye, astigmatismCounts.bothEyes, astigmatismCounts.noAstigmatism],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        borderColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        borderWidth: 2,
      },
    ],
  };

  // Chart Data for Color Blindness Distribution (Doughnut Chart)
  const colorBlindnessChartData = {
    labels: ["Normal Vision", "Mild Color Blindness", "Moderate Color Blindness", "Severe Color Blindness"],
    datasets: [
      {
        label: "Color Blindness Count",
        data: [colorBlindnessCounts.normal || 0, colorBlindnessCounts.mild || 0, colorBlindnessCounts.moderate || 0, colorBlindnessCounts.severe || 0],
        backgroundColor: ["#4BC0C0", "#36A2EB", "#FFCE56", "#FF6384"],
        borderColor: ["#4BC0C0", "#36A2EB", "#FFCE56", "#FF6384"],
        borderWidth: 2,
      },
    ],
  };

  // Chart Data for Sentiment Analysis (Donut Chart)
  const sentimentDonutChartData = {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [
      {
        label: "Sentiment Analysis",
        data: [sentimentResults.positive, sentimentResults.neutral, sentimentResults.negative],
        backgroundColor: ["#4CAF50", "#FFC107", "#F44336"], // Green, Yellow, Red
        borderColor: ["#4CAF50", "#FFC107", "#F44336"], // Green, Yellow, Red
        borderWidth: 2,
      },
    ],
  };

  // Chart Data for Gender Distribution (Bar Chart)
  const genderChartData = {
    labels: ["Male", "Female", "Other"],
    datasets: [
      {
        label: "Gender Count",
        data: [genderData.male, genderData.female, genderData.other],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"], // Blue, Pink, Yellow
        borderColor: ["#36A2EB", "#FF6384", "#FFCE56"],
        borderWidth: 2,
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
                <Line data={reviewsChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This line chart shows the number of anonymous versus non-anonymous reviews submitted by users.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "reviewsChart",
                    "Reviews Statistics",
                    "This line chart shows the number of anonymous versus non-anonymous reviews submitted by users.",
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
                <Radar data={diagnosisChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This radar chart provides an overview of the diagnosis distribution, including nearsightedness, farsightedness, and normal vision.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "diagnosisChart",
                    "Diagnosis Distribution",
                    "This radar chart provides an overview of the diagnosis distribution, including nearsightedness, farsightedness, and normal vision.",
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
                <PolarArea data={astigmatismChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This polar area chart details the distribution of astigmatism cases, categorized by left eye, right eye, both eyes, and no astigmatism.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "astigmatismChart",
                    "Astigmatism Distribution",
                    "This polar area chart details the distribution of astigmatism cases, categorized by left eye, right eye, both eyes, and no astigmatism.",
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
                <Doughnut data={colorBlindnessChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This doughnut chart illustrates the distribution of color blindness cases, ranging from normal vision to severe color blindness.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "colorBlindnessChart",
                    "Color Blindness Distribution",
                    "This doughnut chart illustrates the distribution of color blindness cases, ranging from normal vision to severe color blindness.",
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

          {/* Third Row: Sentiment Analysis Donut Chart */}
          <div className="chart-row">
            <div className="chart-item">
              <h3>Sentiment Analysis</h3>
              <div id="sentimentDonutChart" className="chart-container">
                <Pie
                  data={sentimentDonutChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "70%", // Makes it a donut chart
                    plugins: {
                      datalabels: {
                        color: "#fff",
                        font: {
                          weight: "bold",
                        },
                      },
                    },
                  }}
                />
              </div>
              <p className="chart-description">
                This donut chart shows the distribution of sentiment analysis results, including positive, neutral, and negative sentiments.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "sentimentDonutChart",
                    "Sentiment Analysis",
                    "This donut chart shows the distribution of sentiment analysis results, including positive, neutral, and negative sentiments.",
                    `**Summary:** The chart shows that there are ${sentimentResults.positive} positive, ${sentimentResults.neutral} neutral, and ${sentimentResults.negative} negative sentiments.
          **Analysis:** The majority of sentiments are positive, indicating overall user satisfaction with the system.`
                  )
                }
                className="export-button"
              >
                Export to PDF
              </button>
            </div>

            {/* Gender Distribution Chart */}
            <div className="chart-item">
              <h3>Gender Distribution</h3>
              <div id="genderChart" className="chart-container">
                <Bar data={genderChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="chart-description">
                This bar chart shows the distribution of users by gender, including Male, Female, and Other.
              </p>
              <button
                onClick={() =>
                  exportChartToPDF(
                    "genderChart",
                    "Gender Distribution",
                    "This bar chart shows the distribution of users by gender, including Male, Female, and Other.",
                    `**Summary:** The chart shows that there are ${genderData.male} male users, ${genderData.female} female users, and ${genderData.other} users who identify as other.
                    **Analysis:** The distribution indicates the diversity of the user base, with a balanced representation of genders.`
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