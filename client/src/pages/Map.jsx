import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import api from "../utils/api";

// Map container style — fills the full screen
const containerStyle = {
  width: "100%",
  height: "100vh",
};

// Default center — Bengaluru, Karnataka 🇮🇳
const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946,
};

export default function Map() {
  const [hosts, setHosts] = useState([]);
  // hosts = array of all available charging points fetched from backend

  const [selectedHost, setSelectedHost] = useState(null);
  // selectedHost = the host whose pin was clicked — shows info popup

  const [userLocation, setUserLocation] = useState(defaultCenter);
  // userLocation = rider's current GPS position

  // Fetch all available hosts from backend when page loads
  useEffect(() => {
    const fetchHosts = async () => {
      try {
        const res = await api.get("/hosts");
        setHosts(res.data);
        // Stores all hosts in state so we can drop pins for each one
      } catch (err) {
        console.error("Failed to fetch hosts:", err);
      }
    };
    fetchHosts();
  }, []);
  // The empty [] means this runs ONCE when the component first mounts — like componentDidMount

  // Get user's real GPS location from the browser
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          // Centers the map on the rider's actual location
        },
        () => {
          console.log("Location access denied, using default");
          // If user denies location, we fall back to Bengaluru center
        }
      );
    }
  }, []);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
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
    // Returns distance rounded to 1 decimal place e.g. "3.2"
    // This is the Haversine formula — standard way to calculate distance on a sphere
  };

  return (
    <div className="relative w-full h-screen">

      {/* Top Navbar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-dark/90 backdrop-blur-sm px-6 py-4 flex justify-between items-center border-b border-border">
        {/* z-10 keeps navbar above the map, backdrop-blur gives glassmorphism effect */}
        <h1 className="text-primary font-bold text-xl">⚡ EV-Grama Charge</h1>
        <div className="flex gap-3 items-center">
          <span className="text-secondary text-sm font-medium">
            {hosts.length} charging points nearby
          </span>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="bg-border text-gray-300 px-3 py-1 rounded-lg text-sm hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Google Map */}
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        {/* LoadScript loads the Google Maps JS SDK using our API key */}
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={userLocation}
          zoom={13}
          options={{
            styles: mapStyles,
            // Custom dark theme styles defined below
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {/* Blue pin for rider's current location */}
          <Marker
            position={userLocation}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />

          {/* Green pins for each charging host */}
          {hosts.map((host) => (
            <Marker
              key={host._id}
              position={{
                lat: host.location.coordinates[1],
                lng: host.location.coordinates[0],
                // MongoDB stores [longitude, latitude] but Google Maps needs {lat, lng}
                // So we swap them here — coordinates[1] is lat, coordinates[0] is lng
              }}
              icon={{
                url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
              }}
              onClick={() => setSelectedHost(host)}
              // Clicking a pin sets it as selected — triggers InfoWindow popup
            />
          ))}

          {/* Info popup when a host pin is clicked */}
          {selectedHost && (
            <InfoWindow
              position={{
                lat: selectedHost.location.coordinates[1],
                lng: selectedHost.location.coordinates[0],
              }}
              onCloseClick={() => setSelectedHost(null)}
              // Clicking X clears selectedHost, closing the popup
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
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

// Dark map theme to match our Electric Blue/Green design
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#00D4FF" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1F2937" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0D1B2A" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#111827" }],
  },
];