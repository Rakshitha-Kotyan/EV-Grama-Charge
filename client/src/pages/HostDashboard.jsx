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
  const [myBookings, setMyBookings] = useState([]);
  const [newBookings, setNewBookings] = useState(0);
// ☝️ newBookings = count of unread bookings for the badge

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

  // Fetch bookings for this host
useEffect(() => {
  const fetchBookings = async () => {
    if (!hostData) return;
    try {
      const res = await api.get(`/bookings/host/${hostData._id}`);
      setMyBookings(res.data);
      // Count confirmed bookings from today onwards
      const fresh = res.data.filter(b => b.status === 'confirmed');
      setNewBookings(fresh.length);
      // ☝️ Show badge with count of confirmed bookings
    } catch (err) {
      console.error(err);
    }
  };
  fetchBookings();
}, [hostData]);
// ☝️ Runs whenever hostData changes — so after listing is loaded

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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-primary">⚡ Host Dashboard</h1>
          {/* Notification badge */}
          {newBookings > 0 && (
            <span className="bg-secondary text-dark text-xs font-bold px-2 py-1 rounded-full animate-pulse">
              {newBookings} new booking{newBookings > 1 ? "s" : ""}!
            </span>
          )}
          {/* ☝️ animate-pulse makes it pulse to grab attention */}
        </div>
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
          {/* Incoming Bookings */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              📋 Incoming Bookings
              {newBookings > 0 && (
                <span className="ml-2 bg-secondary text-dark text-xs font-bold px-2 py-1 rounded-full">
                  {newBookings}
                </span>
              )}
            </h2>

            {myBookings.length === 0 ? (
              <p className="text-gray-400 text-sm">No bookings yet — toggle ON to start accepting!</p>
            ) : (
              <div className="space-y-3">
                {myBookings.map(booking => (
                  <div
                    key={booking._id}
                    className="bg-dark rounded-xl p-4 border border-border"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">
                          👤 {booking.rider?.name || "Rider"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {booking.rider?.email}
                        </p>
                      </div>
                      <span className="text-secondary font-bold text-sm">
                        ₹{booking.totalPrice}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Date</p>
                        <p className="text-white text-sm font-semibold">
                          {new Date(booking.date).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Time</p>
                        <p className="text-white text-sm font-semibold">{booking.startTime}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs">Duration</p>
                        <p className="text-white text-sm font-semibold">{booking.durationHours} hr</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs font-bold ${
                        booking.status === 'confirmed' ? 'text-secondary' :
                        booking.status === 'cancelled' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {booking.status.toUpperCase()}
                      </span>
                      <p className="text-gray-500 text-xs">
                        🔌 {booking.durationHours} hr slot
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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