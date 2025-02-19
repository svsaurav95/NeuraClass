import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Pie, Line } from "react-chartjs-2";
import styles from "./PersonalAttendance.module.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const PersonalAttendance = () => {
  const navigate = useNavigate(); // Hook for navigation

  // Pie Chart Data (Subjects Attendance)
  const pieData = {
    labels: ["LAPT", "MS", "DMA", "CNS", "CD"],
    datasets: [
      {
        data: [20, 25, 15, 30, 10], // Placeholder values
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
      },
    ],
  };

  // Line Chart Data (Attendance Over Days)
  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        label: "Attendance",
        data: [80, 85, 78, 90, 88], // Placeholder values
        fill: false,
        borderColor: "#36a2eb",
        tension: 0.2,
      },
    ],
  };

  return (
    <div className={styles.container}>
      {/* Dashboard Button */}
      <button onClick={() => navigate("/dashboard")} className={styles.dashboardButton}>
        ← Dashboard
      </button>

      <div className={styles.card}>
        <h3>Attendance Breakdown</h3>
        <Pie data={pieData} />
      </div>
      <div className={styles.card}>
        <h3>Attendance Trend</h3>
        <Line data={lineData} />
      </div>
    </div>
  );
};

export default PersonalAttendance;
