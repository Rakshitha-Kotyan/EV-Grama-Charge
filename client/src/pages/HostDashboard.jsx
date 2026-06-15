import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMap, Marker, StandaloneSearchBox } from "@react-google-maps/api";
import api from "../utils/api";

const formMapStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "12px",
};

const defaultCenter = { lat: 12.9716, lng: 77.5946 };

export default function HostDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [hostData, setHostData] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pinLocation, setPinLocation] = useState(null);
  const [searchBox, setSearchBox] = useState(null);

  const [form, setForm] = useState({
    shopName: "",
    socketType: "15A",
    pricePerHour: "",
    address: "",
    coordinates: [],
  });

  // Check if host already has a listing
  useEffect(() => {
    const fetchHostData = async () => {
      try {
        const res = await api.get("/hosts");
        const myHost = res.data.find(h => h.user._id === user.id);
        if (myHost) {
          setHostData(myHost);
          setIsAvailable(myHost.isAvailable);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHostData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // When host clicks on the map — reverse geocode to get address
  const handleMapClick = async (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPinLocation({ lat, lng });
    setForm(prev => ({ ...prev, coordinates: [lng, lat] }));

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        setForm(prev => ({ ...prev, address: data.results[0].formatted_address }));
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
    }
  };

  // When search box loads — save reference
  const onSearchBoxLoad = (ref) => {
    setSearchBox(ref);
  };

  // When user selects a place from search suggestions
  const onPlacesChanged = () => {
    const places = searchBox.getPlaces();
    if (places.length === 0) return;

    const place = places[0];
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setPinLocation({ lat, lng });
    setForm(prev => ({
      ...prev,
      coordinates: [lng, lat],
      address: place.formatted_address,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pinLocation) {
      setMessage("Please click on the map to set your location! 📍");
      return;
    }
    setLoading(true);
    try {
      const res = await api.post("/hosts", {
        ...form,
        user: user.id,
      });
      setHostData(res.data.host);
      setMessage("Charging point listed successfully! ⚡");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      const res = await api.patch(`/hosts/${hostData._id}/toggle`);
      setIsAvailable(res.data.isAvailable);
      setMessage(res.data.message);
    } catch (err) {
      setMessage("Toggle failed");
    }
  };

  return (
    <div className="min-h-screen bg-dark text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">⚡ Host Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              sessionStorage.setItem("viewMap", "true");
              navigate("/map");
            }}
            className="bg-border px-4 py-2 rounded-lg text-sm hover:bg-primary/20 transition-all"
          >
            🗺️ View Map
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-border px-4 py-2 rounded-lg text-sm hover:bg-red-500/20 hover:text-red-400 transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="bg-primary/10 border border-primary text-primary px-4 py-3 rounded-lg mb-6">
          {message}
        </div>
      )}

      {/* If host already has listing — show dashboard */}
      {hostData ? (
        <div className="space-y-6">

          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Your Charging Point</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Shop Name</p>
                <p className="font-semibold">{hostData.shopName}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Socket Type</p>
                <p className="font-semibold">🔌 {hostData.socketType}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Price</p>
                <p className="font-semibold">₹{hostData.pricePerHour}/hour</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Address</p>
                <p className="font-semibold">{hostData.address}</p>
              </div>
            </div>
          </div>

          {/* Availability toggle */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Availability</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Current Status</p>
                <p className={`text-lg font-bold ${isAvailable ? "text-secondary" : "text-red-400"}`}>
                  {isAvailable ? "✅ Available — accepting riders" : "❌ Unavailable — not accepting"}
                </p>
              </div>
              <button
                onClick={handleToggle}
                className={`w-16 h-8 rounded-full transition-all duration-300 relative ${
                  isAvailable ? "bg-secondary" : "bg-gray-600"
                }`}
              >
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 ${
                  isAvailable ? "left-9" : "left-1"
                }`} />
              </button>
            </div>
          </div>

        </div>

      ) : (

        /* Registration form — search + map only */
        <div className="bg-card border border-border rounded-2xl p-6 max-w-lg">
          <h2 className="text-xl font-bold mb-6">List Your Charging Point</h2>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm text-gray-400 mb-1">Shop / Home Name</label>
              <input
                type="text"
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Ravi Kirana Store"
                className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Socket Type</label>
              <select
                name="socketType"
                value={form.socketType}
                onChange={handleChange}
                className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
              >
                <option value="5A">5A Socket</option>
                <option value="15A">15A Socket (faster)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">Price per Hour (₹)</label>
              <input
                type="number"
                name="pricePerHour"
                value={form.pricePerHour}
                onChange={handleChange}
                placeholder="20"
                className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            {/* Search + Map — single combined section */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                📍 Search your location then click map to pin exactly
              </label>

              <StandaloneSearchBox
                onLoad={onSearchBoxLoad}
                onPlacesChanged={onPlacesChanged}
              >
                <input
                  type="text"
                  placeholder="🔍 Search e.g. Belthangadi, Karnataka..."
                  className="w-full bg-dark border border-primary rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary mb-2"
                />
              </StandaloneSearchBox>

              <GoogleMap
                mapContainerStyle={formMapStyle}
                center={pinLocation || defaultCenter}
                zoom={pinLocation ? 15 : 12}
                onClick={handleMapClick}
                options={{ styles: darkMapStyles }}
              >
                {pinLocation && (
                  <Marker
                    position={pinLocation}
                    icon={{
                      url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    }}
                  />
                )}
              </GoogleMap>

              {pinLocation && (
                <p className="text-secondary text-sm mt-2">
                  ✅ Location pinned! Click map to adjust precisely.
                </p>
              )}
            </div>

            {/* Address — auto filled */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Address (auto-filled)
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Click the map above to auto-fill..."
                className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-dark font-bold py-3 rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
            >
              {loading ? "Listing..." : "⚡ List My Charging Point"}
            </button>

          </form>
        </div>
      )}
    </div>
  );
}

// Dark map theme
const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#0A0E1A" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#00D4FF" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1F2937" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0D1B2A" }] },
];