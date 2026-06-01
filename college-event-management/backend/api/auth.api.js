
const express = require('express');
const router = express.Router();
const authService = require('../services/auth.service');

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const result = await authService.login(email, password, role);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const { authenticate } = require('../middleware/auth.middleware');

router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', authenticate, async (req, res) => {
  try {
    const user = await authService.updateUser(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
