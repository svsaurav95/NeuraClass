import React, { useState } from "react";
import styles from "./Planner.module.css"; // Import CSS module

const Planner = () => {
  const [formData, setFormData] = useState({
    daily_habits: "",
    study_habits: "",
    subjects: [],
    exam_date: "",
    study_time: "",
    days_of_week: [],
  });

  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setFormData((prev) => ({ ...prev, [name]: selectedValues }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:5000/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
      setStudyPlan(data.study_plan?.replace(/\*/g, "") || "⚠️ Error generating study plan.");
    } catch (error) {
      console.error("Error fetching study plan:", error);
      setStudyPlan("⚠️ Failed to connect to the server.");
    }
  
    setLoading(false);
  };
  

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>📚 Study Plan Generator</h2>
        <label>Daily Habits:</label>
        <input type="text" name="daily_habits" onChange={handleChange} required />

        <label>Study Habits:</label>
        <input type="text" name="study_habits" onChange={handleChange} required />

        <label>Select Subject:</label>
        <select name="subjects" multiple onChange={handleMultiSelect} required>
          <option value="Math">Math</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
          <option value="English">English</option>
        </select>

        <label>Exam Date:</label>
        <input type="date" name="exam_date" onChange={handleChange} required />

        <label>Preferred Study Time:</label>
        <input type="time" name="study_time" onChange={handleChange} required />

        <label>Preferred Studying Day:</label>
        <select name="days_of_week" multiple onChange={handleMultiSelect} required>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "⏳ Generating..." : "Generate Plan"}
        </button>
      </form>

      {studyPlan && (
        <div className={styles.result}>
          <h3>📅 Your Study Plan:</h3>
          <p>{studyPlan}</p>
        </div>
      )}
    </div>
  );
};

export default Planner;
