const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'mindbridge_secret', {
  expiresIn: process.env.JWT_EXPIRE || '7d'
});

// @POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, university, department, yearOfStudy, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Please provide all required fields' });
    
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    
    const user = await User.create({ name, email, password, university, department, yearOfStudy, role: role || 'student' });
    
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wellness: user.wellness }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// @POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({
      success: true,
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, wellness: user.wellness, preferences: user.preferences }
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// @GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// @PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, university, department, yearOfStudy, phone, emergencyContact, preferences } = req.body;
    const user = await User.findById(req.user._id);
    
    if (name) user.name = name;
    if (university) user.university = university;
    if (department) user.department = department;
    if (yearOfStudy) user.yearOfStudy = yearOfStudy;
    if (phone) user.phone = phone;
    if (emergencyContact) user.emergencyContact = { ...user.emergencyContact, ...emergencyContact };
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router;
