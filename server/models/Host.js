const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  shopName: {
    type: String,
    required: true,
    trim: true
  },
  socketType: {
    type: String,
    enum: ['5A', '15A'],
    required: true
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  address: {
    type: String,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// This enables location-based queries (finding nearby hosts)
hostSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Host', hostSchema);