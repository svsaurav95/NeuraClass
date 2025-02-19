import React, { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import { Upload, Camera, UserCheck } from "lucide-react";

const FLASK_BACKEND_URL = "http://localhost:5000";

const FaceRecog = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [attendance, setAttendance] = useState({});
  const webcamRef = useRef(null);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {  
      setUploadStatus("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(`${FLASK_BACKEND_URL}/upload_student`, formData);
      setUploadStatus(response.data.message);
    } catch (error) {
      setUploadStatus("Error uploading file. Please try again.");
      console.error("Upload error:", error);
    }
  };

  const toggleWebcam = () => {
    setShowWebcam(!showWebcam);
  };

  // Function to fetch attendance from Flask
  const fetchAttendance = useCallback(async () => {
    try {
      const response = await axios.get(`${FLASK_BACKEND_URL}/attendance`);
      setAttendance(response.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  }, []);
  

  // Auto-refresh attendance every 3 seconds while webcam is active
  useEffect(() => {
    if (showWebcam) {
      fetchAttendance(); // Fetch initially when webcam starts
      const interval = setInterval(fetchAttendance, 3000);
      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [showWebcam, fetchAttendance]);

  return (
    <div className="container">
      <div className="content">
        <div className="card">
          <h1 className="title">Face Recognition Attendance System</h1>

          {/* File Upload Section */}
          <div className="upload-section">
            <h2 className="section-title">
              <Upload size={24} /> Upload Student Photo
            </h2>
            <div className="file-input-container">
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="file-input"
              />
              <button onClick={handleUpload} className="button button-primary">
                Upload
              </button>
            </div>
            {uploadStatus && (
              <p className={`status-message ${uploadStatus.includes("Error") ? "error" : "success"}`}>
                {uploadStatus}
              </p>
            )}
          </div>

          {/* Webcam Section */}
          <div className="webcam-section">
            <div className="webcam-header">
              <h2 className="section-title">
                <Camera size={24} /> Live Recognition
              </h2>
              <button
                onClick={toggleWebcam}
                className={`button ${showWebcam ? "button-danger" : "button-success"}`}
              >
                {showWebcam ? "Stop Camera" : "Start Camera"}
              </button>
            </div>

            {showWebcam && (
              <div className="video-container">
                <img
                  src={`${FLASK_BACKEND_URL}/video_feed`}
                  alt="Video feed"
                  className="video-feed"
                />
              </div>
            )}
          </div>

          {/* Attendance List */}
          <div className="upload-section">
            <h2 className="section-title">
              <UserCheck size={24} /> Attendance List
            </h2>
            <div className="attendance-grid">
            {Object.entries(attendance).length > 0 ? (
  Object.entries(attendance).map(([student, details]) => (
    <div key={student} className="attendance-card">
      <p className="student-roll">Roll No: {student}</p>
      <p className="student-status">{details.status}</p>
      <p className="student-time">Marked at: {details.timestamp}</p>
    </div>
  ))
) : (
  <p className="no-attendance">No students marked present yet.</p>
)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceRecog;
