import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Attendance from "./pages/Attendance.jsx";
import Navbar from "./components/Navbar.jsx";
import "./style.css";

const App = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/attendance" element={<Attendance />} />
    </Routes>
  </BrowserRouter>
);

export default App;
