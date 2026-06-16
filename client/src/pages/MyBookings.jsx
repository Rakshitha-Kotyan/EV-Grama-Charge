import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function MyBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get(`/bookings/rider/${user.id}`);
        setBookings(res.data);
        // ☝️ Fetch all bookings for this rider
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Color coding for booking status
  const statusColor = {
    confirmed: "text-secondary",
    pending: "text-yellow-400",
    completed: "text-blue-400",
    cancelled: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-dark text-white p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-primary">⚡ My Bookings</h1>
        <button
          onClick={() => navigate("/map")}
          className="bg-border px-4 py-2 rounded-lg text-sm hover:bg-primary/20 transition-all"
        >
          🗺️ Back to Map
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="text-center text-gray-400 mt-20">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        /* Empty state */
        <div className="text-center mt-20">
          <p className="text-6xl mb-4">⚡</p>
          <p className="text-gray-400 text-lg">No bookings yet!</p>
          <p className="text-gray-500 text-sm mt-2">Find a charging point on the map</p>
          <button
            onClick={() => navigate("/map")}
            className="mt-6 bg-primary text-dark font-bold px-6 py-3 rounded-lg"
          >
            Find Charging Points
          </button>
        </div>
      ) : (
        /* Bookings list */
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking._id}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">
                    ⚡ {booking.host?.shopName}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    📍 {booking.host?.address}
                  </p>
                </div>
                <span className={`font-bold text-sm ${statusColor[booking.status]}`}>
                  {booking.status.toUpperCase()}
                </span>
                {/* ☝️ Status badge color changes based on booking state */}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-dark rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Date</p>
                  <p className="text-white font-semibold text-sm">
                    {new Date(booking.date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="bg-dark rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Time</p>
                  <p className="text-white font-semibold text-sm">{booking.startTime}</p>
                </div>
                <div className="bg-dark rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-xs mb-1">Total</p>
                  <p className="text-secondary font-bold">₹{booking.totalPrice}</p>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <p className="text-gray-400 text-sm">
                  🔌 {booking.host?.socketType} • {booking.durationHours} hr
                </p>
                <p className="text-gray-500 text-xs">
                  Booked {new Date(booking.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}