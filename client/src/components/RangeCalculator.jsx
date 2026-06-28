import { useState } from "react";

export default function RangeCalculator({ socketType = "15A", onClose }) {
  // socketType passed from host card — affects charging speed

  const [batteryCapacity, setBatteryCapacity] = useState(2.5);
  // ☝️ kWh — most e-scooters are 2-3 kWh

  const [chargeMinutes, setChargeMinutes] = useState(30);
  // ☝️ How many minutes the rider plans to charge

  const [currentCharge, setCurrentCharge] = useState(20);
  // ☝️ Current battery percentage

  // Charging speed depends on socket type
  const chargingRateKw = socketType === "15A" ? 1.5 : 0.5;
  // ☝️ 15A socket charges roughly 3x faster than 5A
  // 15A ≈ 1.5 kW input, 5A ≈ 0.5 kW input (simplified estimates)

  const consumptionPerKm = 0.04;
  // ☝️ kWh per km — typical e-scooter consumption (40 Wh/km)

  // Calculate everything
  const calculateRange = () => {
    const chargeHours = chargeMinutes / 60;
    const energyAdded = chargingRateKw * chargeHours;
    // ☝️ Energy added in kWh during the charging window

    const energyAddedPercent = (energyAdded / batteryCapacity) * 100;
    // ☝️ Convert energy added into a percentage of total battery

    const newChargePercent = Math.min(currentCharge + energyAddedPercent, 100);
    // ☝️ Cap at 100% — can't overcharge!

    const usableEnergy = (newChargePercent / 100) * batteryCapacity;
    // ☝️ Total usable energy after charging

    const rangeKm = usableEnergy / consumptionPerKm;
    // ☝️ Final answer — how far you can travel

    return {
      energyAdded: energyAdded.toFixed(2),
      newChargePercent: newChargePercent.toFixed(0),
      rangeKm: rangeKm.toFixed(1),
    };
  };

  const result = calculateRange();

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary">🔋 Range Calculator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl leading-none">
            ✕
          </button>
        </div>

        <div className="space-y-5">

          {/* Battery capacity input */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Your EV Battery Capacity (kWh)
            </label>
            <input
              type="number"
              step="0.1"
              value={batteryCapacity}
              onChange={e => setBatteryCapacity(Number(e.target.value))}
              className="w-full bg-dark border border-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Most e-scooters: 2-3 kWh (check your vehicle manual)
            </p>
          </div>

          {/* Current charge slider */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Current Battery: {currentCharge}%
            </label>
            <input
              type="range"
              min="0"
              max="90"
              value={currentCharge}
              onChange={e => setCurrentCharge(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Charging duration slider */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Charging Duration: {chargeMinutes} minutes
            </label>
            <input
              type="range"
              min="10"
              max="120"
              step="5"
              value={chargeMinutes}
              onChange={e => setChargeMinutes(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>10 min</span>
              <span>1 hr</span>
              <span>2 hrs</span>
            </div>
          </div>

          {/* Socket type indicator */}
          <div className="bg-dark rounded-xl p-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">Socket Type</span>
            <span className="text-white font-bold">🔌 {socketType}</span>
          </div>

          {/* Results */}
          <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary rounded-xl p-5 text-center">
            <p className="text-gray-300 text-sm mb-1">With this charge, you can travel</p>
            <p className="text-4xl font-bold text-secondary mb-2">
              {result.rangeKm} km
            </p>
            <div className="flex justify-center gap-6 mt-3 text-sm">
              <div>
                <p className="text-gray-400">Battery after</p>
                <p className="text-white font-bold">{result.newChargePercent}%</p>
              </div>
              <div>
                <p className="text-gray-400">Energy added</p>
                <p className="text-white font-bold">{result.energyAdded} kWh</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            ⚠️ Estimates only — actual range varies by vehicle, terrain, and riding style
          </p>

        </div>
      </div>
    </div>
  );
}