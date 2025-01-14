const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose').Types;

// Register a new user
const register = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password || !email) {
    return res.status(400).send({ message: 'username, password, and email are required' });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send({ message: 'User with that email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.validate();
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).send({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error creating user:', error.message);
    res.status(500).send({ message: 'Error creating user', error: error.message });
  }
};

// Login a user
const login = async (req, res) => {
  const { username, email, password } = req.body;
  if ((!username && !email) || !password) {
    return res.status(400).send({ message: 'Username (or email) and password are required' });
  }

  try {
    const user = await User.findOne({ $or: [{ username }, { email }] });
    if (!user || !bcrypt.compare(password, user.password)) {
      return res.status(401).send({ message: 'Invalid username/email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).send({
      token,
      user: {
        _id: user._id
      },
    });
  } catch (error) {
    console.error('Error logging in user:', error.message);
    res.status(500).send({ message: 'Error logging in user', error: error.message });
  }
};

// Get a user by ID
const getUser = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).send({ message: 'Error fetching user', error: error.message });
  }
};

// Update a user by ID
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, bio } = req.body;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid user ID' });
  }
  if (!username || !email) {
    return res.status(400).send({ message: 'Username and email are required' });
  }

  try {
    const user = await User.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: { username, email, bio } });
    if (!user) {
      res.status(404).send({ message: 'User not found' });
    }
    res.status(200).send({ message: 'User updated' });
  } catch (error) {
    console.error('Error updating user:', error.message);
    res.status(500).send({ message: 'Error updating user', error: error.message });
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid user ID' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if (user._id.toString() !== req.user.id) {
      return res.status(403).send({ message: 'You are not allowed to delete this user' });
    }

    await User.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).send({ message: 'Error deleting user', error: error.message });
  }
};

// Update a user's password by ID
const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid user ID' });
  }
  if (!oldPassword || !newPassword) {
    return res.status(400).send({ message: 'oldPassword and newPassword are required' });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    if (user._id.toString() !== req.user.id) {
      return res.status(403).send({ message: 'You are not allowed to update this user' });
    }
    if (!bcrypt.compare(oldPassword, user.password)) {
      return res.status(401).send({ message: 'Invalid old password' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: new ObjectId(id) }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: 'User password updated' });
  } catch (error) {
    console.error('Error updating user password:', error.message);
    res.status(500).send({ message: 'Error updating user password', error: error.message });
  }
};

module.exports = { register, login, getUser, updateUser, deleteUser, updatePassword };
