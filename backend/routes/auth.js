// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const router = express.Router();

// POST /api/auth/signup 
const axios = require('axios');

// Utility to validate real email using MailboxLayer
const verifyEmailWithMailboxLayer = async (email) => {
  const API_KEY = "4e09dbf3f6963079c4cb693e29746b09";

  const url = `http://apilayer.net/api/check?access_key=${API_KEY}&email=${email}&smtp=1&format=1`;

  const { data } = await axios.get(url);

  return data.smtp_check && data.format_valid && !data.disposable;
};


router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, college } = req.body;
     const isRealEmail = await verifyEmailWithMailboxLayer(email);
    if (!isRealEmail) {
      return res.status(400).json({ msg: 'Please provide a valid and active email address.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, role, college });
    await newUser.save();

    // Create JWT token
    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, college: newUser.college },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const user = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      college: newUser.college
    };

    res.status(201).json({ user, token });

  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});


// ✅ POST /api/auth/login — updated to return token + user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      msg: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
      }
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
