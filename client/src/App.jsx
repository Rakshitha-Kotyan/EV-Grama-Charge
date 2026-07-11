import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Map from "./pages/Map";
import HostDashboard from "./pages/HostDashboard";
import MyBookings from "./pages/MyBookings";
import Landing from "./pages/Landing";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes — outside LoadScript */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes — need Maps, wrap in LoadScript */}
        <Route path="/map" element={
          <PrivateRoute>
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
            >
              <Map />
            </LoadScript>
          </PrivateRoute>
        } />
        <Route path="/host-dashboard" element={
          <PrivateRoute>
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
            >
              <HostDashboard />
            </LoadScript>
          </PrivateRoute>
        } />
        <Route path="/my-bookings" element={
          <PrivateRoute>
            <MyBookings />
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}