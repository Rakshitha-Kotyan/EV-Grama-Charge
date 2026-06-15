import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Map from "./pages/Map";
import HostDashboard from "./pages/HostDashboard";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <LoadScript 
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={["places"]}
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={
            <PrivateRoute>
              <Map />
            </PrivateRoute>
          } />
          <Route path="/host-dashboard" element={
            <PrivateRoute>
              <HostDashboard />
            </PrivateRoute>
          } />
        </Routes>
      </LoadScript>
    </BrowserRouter>
  );
}