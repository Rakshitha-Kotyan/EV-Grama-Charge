const express = require('express');
const router = express.Router();
const Host = require('../models/Host');

// GET all available hosts
router.get('/', async (req, res) => {
  try {
    const hosts = await Host.find({ isAvailable: true })
      .populate('user', 'name email');

    res.json(hosts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET single host by ID
router.get('/:id', async (req, res) => {
  try {
    const host = await Host.findById(req.params.id)
      .populate('user', 'name email');

    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    res.json(host);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST create a new host listing
router.post('/', async (req, res) => {
  try {
    const { user, shopName, socketType, pricePerHour, coordinates, address } = req.body;

    const host = new Host({
      user,
      shopName,
      socketType,
      pricePerHour,
      address,
      location: {
        type: 'Point',
        coordinates // [longitude, latitude]
      }
    });

    await host.save();
    res.status(201).json({ message: 'Host listed successfully', host });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH toggle availability
router.patch('/:id/toggle', async (req, res) => {
  try {
    const host = await Host.findById(req.params.id);

    if (!host) {
      return res.status(404).json({ message: 'Host not found' });
    }

    host.isAvailable = !host.isAvailable;
    await host.save();

    res.json({
      message: `Host is now ${host.isAvailable ? 'Available ✅' : 'Unavailable ❌'}`,
      isAvailable: host.isAvailable
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;