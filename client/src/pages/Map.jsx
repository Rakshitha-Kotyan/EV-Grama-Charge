import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import BookingModal from "../components/BookingModal";
import api from "../utils/api";

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

export default function Map() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const comingFromDashboard = sessionStorage.getItem("viewMap");
    if (user?.role === "host" && !comingFromDashboard) {
      navigate("/host-dashboard");
    }
  }, []);

  const [hosts, setHosts] = useState([]);
  const [selectedHost, setSelectedHost] = useState(null);
  const [userLocation, setUserLocation] = useState(defaultCenter);
  const [bookingHost, setBookingHost] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const res = await api.get("/hosts");
        setHosts(res.data);
      } catch (err) {
        console.error("Failed to fetch hosts:", err);
      }
    };
    fetchHosts();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Location access denied, using default");
        }
      );
    }
  }, []);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  return (
    <div className="relative w-full h-screen">

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-dark/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-border">
        <h1 className="text-primary font-bold text-xl">⚡ EV-Grama Charge</h1>
        <div className="flex gap-3 items-center">
          <span className="text-secondary text-sm font-medium hidden sm:block">
            {hosts.length} charging points nearby
          </span>
          <button
            onClick={() => navigate("/my-bookings")}
            className="bg-border text-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-primary/20 transition-all"
          >
            📋 My Bookings
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.href = "/";
            }}
            className="bg-border text-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Demo Banner */}
      <div className="absolute top-16 left-0 right-0 z-10 bg-primary/10 border-b border-primary/30 px-6 py-2 flex items-center justify-center">
        <span className="text-primary text-xs font-semibold tracking-wide text-center">
          ⚡ DEMO MODE — Pins marked [DEMO] are sample data. Real hosts & riders can register freely! 🇮🇳
        </span>
      </div>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation}
        zoom={13}
        options={{
          styles: mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
        }}
      >
        {/* Blue pin — rider's current location */}
        <Marker
          position={userLocation}
          icon={{
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          }}
        />

        {/* Green pins — each charging host */}
        {hosts.map((host) => (
          <Marker
            key={host._id}
            position={{
              lat: host.location.coordinates[1],
              lng: host.location.coordinates[0],
            }}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
            }}
            onClick={() => setSelectedHost(host)}
          />
        ))}

        {/* Info popup when host pin is clicked */}
        {selectedHost && (
          <InfoWindow
            position={{
              lat: selectedHost.location.coordinates[1],
              lng: selectedHost.location.coordinates[0],
            }}
            onCloseClick={() => setSelectedHost(null)}
          >
            <div style={{ color: "#000", minWidth: "200px" }}>
              <h3 style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>
                ⚡ {selectedHost.shopName}
              </h3>
              <p>🔌 Socket: {selectedHost.socketType}</p>
              <p>💰 ₹{selectedHost.pricePerHour}/hour</p>
              <p>📍 {selectedHost.address}</p>
              <p>📏 {calculateDistance(
                userLocation.lat,
                userLocation.lng,
                selectedHost.location.coordinates[1],
                selectedHost.location.coordinates[0]
              )} km away</p>
              <p style={{ color: selectedHost.isAvailable ? "green" : "red", fontWeight: "bold" }}>
                {selectedHost.isAvailable ? "✅ Available" : "❌ Busy"}
              </p>
              <button
                onClick={() => {
                  setBookingHost(selectedHost);
                  setSelectedHost(null);
                }}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  background: "#00D4FF",
                  color: "#0A0E1A",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px",
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                ⚡ Book Now
              </button>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Booking success message */}
      {bookingSuccess && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-secondary text-dark px-6 py-3 rounded-xl font-bold z-20 shadow-lg">
          ✅ Booking Confirmed! Check My Bookings.
        </div>
      )}

      {/* Booking modal */}
      {bookingHost && (
        <BookingModal
          host={bookingHost}
          userLocation={userLocation}
          onClose={() => setBookingHost(null)}
          onSuccess={() => {
            setBookingHost(null);
            setBookingSuccess(true);
            setTimeout(() => setBookingSuccess(false), 4000);
          }}
        />
      )}
    </div>
  );
}

const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#00D4FF" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1F2937" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#111827" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D1B2A" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#111827" }] },
];