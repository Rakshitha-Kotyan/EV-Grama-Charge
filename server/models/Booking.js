const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  rider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Host',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  durationHours: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);