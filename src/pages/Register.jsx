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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Register Student
            </h2>
            <p className="text-gray-600">
              Create a new student profile with video verification
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter student ID"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Video
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
                />
              </div>
            </div>
            {videoPreview && (
              <div className="mt-6">
                <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                  <video
                    src={videoPreview}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-64 object-cover"
                    ref={videoRef}
                    onPlay={handleVideoPlay}
                    onLoadedMetadata={handleVideoPlay}
                    controls={false}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 2 }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  Face detection in progress...
                </p>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Registering...
                </div>
              ) : (
                "Register Student"
              )}
            </button>
          </form>
          {message && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-center font-medium">
              {message}
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-center font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
