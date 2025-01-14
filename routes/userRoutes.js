const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  register,
  login,
  getUser,
  updateUser,
  deleteUser,
  updatePassword
} = require('../controllers/userController');

router.post('/register', register);
router.post('/login', login);
router.get('/:id', authenticate, getUser);
router.put('/:id', authenticate, updateUser);
router.delete('/:id', authenticate, deleteUser);
router.patch('/:id/password', authenticate, updatePassword);

module.exports = router;