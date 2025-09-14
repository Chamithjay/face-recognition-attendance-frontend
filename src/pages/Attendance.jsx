import React, { useState } from "react";
import api from "../api/Api.jsx";

const Attendance = () => {
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setVideo(file);
    if (file) {
      setVideoPreview(URL.createObjectURL(file));
    } else {
      setVideoPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setStudents([]);
    const formData = new FormData();
    if (video) formData.append("file", video);
    try {
      const response = await api.post("/attendance/upload-video", formData);
      if (response.status === 200 && response.data.recognized_students) {
        setStudents(response.data.recognized_students);
      } else {
        setError("No students recognized.");
      }
    } catch (err) {
      setError("Failed to get attendance. Try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Get Attendance
            </h2>
            <p className="text-gray-600">Upload a video to identify students</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all duration-200"
              />
            </div>
            {videoPreview && (
              <div className="mt-6">
                <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full h-64 object-cover"
                  />
                </div>
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
                  Processing...
                </div>
              ) : (
                "Get Attendance"
              )}
            </button>
          </form>
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-center font-medium">
              {error}
            </div>
          )}
          {students.length > 0 && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                  Recognized Students ({students.length})
                </h3>
                <div className="space-y-3">
                  {students.map((s, index) => (
                    <div
                      key={s.id}
                      className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                    >
                      <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-600">
                          ID: {s.student_id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
