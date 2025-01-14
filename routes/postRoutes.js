const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  getAllPosts,
  getPost,
  createPost,
  updatePost,
  updateFeatured,
  deletePost
} = require('../controllers/postController');

router.get('/', getAllPosts);
router.get('/:id', getPost);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.patch('/:id/featured', authenticate, updateFeatured);
router.delete('/:id', authenticate, deletePost);

module.exports = router;