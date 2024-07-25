const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Use consistent naming

module.exports = router;

// Get All Users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get One User
router.get('/:id', getUser, (req, res) => {
    res.json(res.user); // Return the user object
});

// Create One User
router.post('/', async (req, res) => {
    const { username, password_hash, email, first_name, last_name, phone_number } = req.body;

    const user = new User({
        username,
        password_hash,
        email,
        first_name,
        last_name,
        phone_number
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update One User
router.patch('/:id', getUser, async (req, res) => {
    const { username, password_hash, email, first_name, last_name, phone_number } = req.body;

    if (username != null) {
        res.user.username = username;
    }
    if (password_hash != null) {
        res.user.password_hash = password_hash;
    }
    if (email != null) {
        res.user.email = email;
    }
    if (first_name != null) {
        res.user.first_name = first_name;
    }
    if (last_name != null) {
        res.user.last_name = last_name;
    }
    if (phone_number != null) {
        res.user.phone_number = phone_number;
    }

    try {
        const updatedUser = await res.user.save();
        res.json(updatedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete One User
router.delete('/:id', getUser, async (req, res) => {
    try {
        await res.user.deleteOne();
        res.json({ message: 'Deleted User' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Middleware to get user by ID
async function getUser(req, res, next) {
    let user;
    try {
        user = await User.findById(req.params.id);
        if (user == null) {
            return res.status(404).json({ message: 'Cannot find user' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    res.user = user;
    next();
}

