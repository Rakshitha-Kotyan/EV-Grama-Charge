import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Simple check — if token exists in localStorage, user is logged in
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
  // If no token, redirect to login page automatically
};

export default function App() {
  return (
    <BrowserRouter>
      {/* BrowserRouter enables URL-based navigation throughout the app */}
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        {/* Root URL redirects to login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/map" element={
          <PrivateRoute>
            <div className="text-white text-center mt-20 text-2xl">
              🗺️ Map coming soon...
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}