import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import api from "../api/Api.jsx";

const Register = () => {
  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // Load face-api.js models once
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models/tiny_face_detector";
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log("TinyFaceDetector model loaded");
      } catch (err) {
        console.error("Failed to load TinyFaceDetector model", err);
      }
    };
    loadModels();
  }, []);

  // Real face detection and drawing
  const handleVideoPlay = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    // Ensure canvas size matches video size after metadata is loaded
    const setCanvasSize = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    };
    setCanvasSize();
    console.log("Video playing, size:", video.videoWidth, video.videoHeight);

    const detect = async () => {
      if (video.paused || video.ended) return;
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (detections.length > 0) {
        faceapi.draw.drawDetections(
          canvas,
          faceapi.resizeResults(detections, {
            width: video.videoWidth,
            height: video.videoHeight,
          })
        );
      } else {
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  // Clean up object URL when video changes
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  // Warn user to download models if not present
  useEffect(() => {
    if (!window.location.pathname.startsWith("/models")) {
      // You must download face-api.js models and place them in /public/models
      // https://github.com/justadudewhohacks/face-api.js-models
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const formData = new FormData();
    formData.append("student_id", studentId);
    formData.append("name", name);
    formData.append("email", email);
    if (video) {
      formData.append("video", video);
    }
    try {
      const response = await api.post("/students/register", formData);
      const data = response.data;
      if (response.status === 200) {
        setMessage(data.message || "Student registered successfully!");
        setStudentId("");
        setName("");
        setEmail("");
        setVideo(null);
      } else {
        setError(data.detail || "Registration failed.");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    } else {
      setVideoPreview(null);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border border-gray-200 rounded-lg shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">Register Student</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700">Video</label>
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {videoPreview && (
          <div className="mt-4 relative">
            <video
              src={videoPreview}
              autoPlay
              loop
              muted
              playsInline
              className="w-full rounded"
              ref={videoRef}
              onPlay={handleVideoPlay}
              onLoadedMetadata={handleVideoPlay}
              style={{ objectFit: "cover" }}
              controls={false}
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 2 }}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {message && (
        <div className="text-green-600 mt-4 text-center">{message}</div>
      )}
      {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
    </div>
  );
};

export default Register;
