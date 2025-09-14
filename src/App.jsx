import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Register from "./pages/Register.jsx";
import "./style.css";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/register" element={<Register />} />
    </Routes>
  </BrowserRouter>
);

export default App;
