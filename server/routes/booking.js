const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Host = require('../models/Host');

// POST — create a new booking
router.post('/', async (req, res) => {
  try {
    const { rider, host, date, startTime, durationHours } = req.body;

    // Find the host to get price
    const hostData = await Host.findById(host);
    if (!hostData) {
      return res.status(404).json({ message: 'Host not found' });
    }
    // ☝️ We fetch the host first to calculate total price from their pricePerHour

    if (!hostData.isAvailable) {
      return res.status(400).json({ message: 'Host is currently unavailable' });
    }
    // ☝️ Prevent booking if host toggled OFF

    const totalPrice = hostData.pricePerHour * (durationHours || 1);
    // ☝️ Calculate price — default 1 hour if not specified

    const booking = new Booking({
      rider,
      host,
      date,
      startTime,
      durationHours: durationHours || 1,
      totalPrice,
      status: 'confirmed'
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking confirmed! ✅',
      booking
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — get all bookings for a specific rider
router.get('/rider/:riderId', async (req, res) => {
  try {
    const bookings = await Booking.find({ rider: req.params.riderId })
      .populate('host', 'shopName address pricePerHour socketType')
      .sort({ createdAt: -1 });
      // ☝️ populate fetches host details, sort(-1) shows newest bookings first

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET — get all bookings for a specific host
router.get('/host/:hostId', async (req, res) => {
  try {
    const bookings = await Booking.find({ host: req.params.hostId })
      .populate('rider', 'name email')
      .sort({ createdAt: -1 });
      // ☝️ Host sees who booked their socket

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH — update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
      // ☝️ { new: true } returns the updated document, not the old one
    );

    res.json({ message: 'Booking updated', booking });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;