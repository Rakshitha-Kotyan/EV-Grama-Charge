import { useState } from "react";
import api from "../utils/api";
import RangeCalculator from "./RangeCalculator";

export default function BookingModal({ host, userLocation, onClose, onSuccess }) {
  // host = the selected host data passed from Map page
  // onClose = function to close the modal
  // onSuccess = function called after successful booking

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [duration, setDuration] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  // ☝️ Get logged in rider's info

  const totalPrice = host.pricePerHour * duration;
  // ☝️ Calculate price dynamically as duration changes

  // Calculate distance between rider and host
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

  const distance = calculateDistance(
    userLocation.lat,
    userLocation.lng,
    host.location.coordinates[1],
    host.location.coordinates[0]
  );

  const handleBooking = async () => {
    if (!date || !startTime) {
      setError("Please select both date and time!");
      return;
    }
    // ☝️ Validate before sending to backend

    setLoading(true);
    setError("");

    try {
      await api.post("/bookings", {
        rider: user.id,
        host: host._id,
        date,
        startTime,
        durationHours: duration,
        // ☝️ Send all booking details to backend
      });

      onSuccess();
      // ☝️ Tell Map page booking was successful
    } catch (err) {
      setError(err.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full screen overlay — clicking outside closes modal
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Modal card — stop click from closing when clicking inside */}
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Host info header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-bold text-primary">⚡ {host.shopName}</h2>
            <p className="text-gray-400 text-sm mt-1">📍 {host.address}</p>
            <p className="text-gray-400 text-sm">📏 {distance} km away</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Host details */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-dark rounded-xl p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Socket</p>
            <p className="text-white font-bold">🔌 {host.socketType}</p>
          </div>
          <div className="bg-dark rounded-xl p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Price</p>
            <p className="text-white font-bold">₹{host.pricePerHour}/hr</p>
          </div>
          <div className="bg-dark rounded-xl p-3 text-center">
            <p className="text-gray-400 text-xs mb-1">Status</p>
            <p className={`font-bold text-sm ${host.isAvailable ? "text-secondary" : "text-red-400"}`}>
              {host.isAvailable ? "✅ Open" : "❌ Busy"}
            </p>
          </div>
        </div>


        {/* Range Calculator trigger button */}
          <button
            onClick={() => setShowCalculator(true)}
            className="w-full bg-secondary/10 border border-secondary text-secondary font-semibold py-2 rounded-lg mb-4 hover:bg-secondary/20 transition-all"
          >
            🔋 Calculate My Range
          </button>

        {/* Booking form */}
        <div className="space-y-4">

          {/* Date picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              // ☝️ min prevents selecting past dates
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            />
          </div>

          {/* Time picker */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Time</label>
            <select
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
                >
                <option value="">Select time...</option>
                {Array.from({ length: 24 }, (_, i) => {
                    const hour = i;
                    const ampm = hour < 12 ? "AM" : "PM";
                    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const value = `${String(hour).padStart(2, "0")}:00`;
                    const label = `${displayHour}:00 ${ampm}`;
                    return (
                    <option key={value} value={value}>{label}</option>
                    );
                })}
                </select>
          </div>

          {/* Duration selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Duration: {duration} hour{duration > 1 ? "s" : ""}
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 hr</span>
              <span>2 hrs</span>
              <span>3 hrs</span>
              <span>4 hrs</span>
            </div>
            {/* ☝️ Range slider lets rider pick 1-4 hours — price updates instantly */}
          </div>

          {/* Price summary */}
          <div className="bg-dark rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm">Total Price</p>
              <p className="text-2xl font-bold text-secondary">₹{totalPrice}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Duration</p>
              <p className="text-white font-semibold">{duration} hr × ₹{host.pricePerHour}</p>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          {/* Book button */}
          <button
            onClick={handleBooking}
            disabled={loading || !host.isAvailable}
            className="w-full bg-primary text-dark font-bold py-3 rounded-lg hover:bg-primary/80 transition-all disabled:opacity-50"
          >
            {loading ? "Booking..." : !host.isAvailable ? "Host Unavailable" : `⚡ Confirm Booking — ₹${totalPrice}`}
          </button>

        </div>
      </div>
      {showCalculator && (
        <RangeCalculator
          socketType={host.socketType}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
}