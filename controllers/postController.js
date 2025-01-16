const Post = require('../models/Post');
const { ObjectId } = require('mongoose').Types;

// Get all posts
const getAllPosts = async (req, res) => {
  const { 
    page = 1, 
    limit = 10,
    sort = 'newest',
    category,
    featured,
    search,
    startDate,
    endDate
  } = req.query;

  try {
    // Build filter object
    const filter = {};
    
    if (category) {
      filter.categories = category;
    }
    
    if (featured !== undefined) {
      filter.featured = featured === 'true';
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) filter.created_at.$gte = new Date(startDate);
      if (endDate) filter.created_at.$lte = new Date(endDate);
    }

    // Determine sort configuration
    let sortConfig = {};
    switch (sort) {
      case 'oldest':
        sortConfig = { created_at: 1 };
        break;
      case 'title-asc':
        sortConfig = { title: 1 };
        break;
      case 'title-desc':
        sortConfig = { title: -1 };
        break;
      case 'newest':
      default:
        sortConfig = { created_at: -1 };
    }

    const posts = await Post.find(filter)
      .sort(sortConfig)
      .skip((page - 1) * limit)
      .limit(limit);

    const totalPosts = await Post.countDocuments(filter);

    res.status(200).json({
      posts,
      totalPosts,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalPosts / limit)
    });
  } catch (error) {
    console.error('Error fetching all posts:', error.message);
    res.status(500).json({ message: 'Error fetching all posts', error: error.message });
  }
};

// Get a single post by ID
const getPost = async (req, res) => {
  const { id } = req.params;
  if (!id || !ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Error fetching post', error: error.message });
  }
};

// Create a new post
const createPost = async (req, res) => {
  const { title, content, categories = [] } = req.body;
  if (!title || !content) {
    return res.status(400).send({ message: 'Title and content are required' });
  }

  // Validate categories is an array
  if (!Array.isArray(categories)) {
    return res.status(400).send({ message: 'Categories must be an array' });
  }

  try {
    const post = new Post({ 
      title, 
      content, 
      categories,
      user_id: new ObjectId(req.user.id) 
    });
    await post.validate();
    await post.save();
    res.status(201).send({ post });
  } catch (error) {
    console.error('Error creating post:', error.message);
    res.status(500).send({ message: 'Error creating post', error: error.message });
  }
};

// Update a post by ID
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content, featured, categories } = req.body;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid post ID' });
  }
  if (!title || !content) {
    return res.status(400).send({ message: 'Title and content are required' });
  }
  if (categories && !Array.isArray(categories)) {
    return res.status(400).send({ message: 'Categories must be an array' });
  }
  
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).send({ message: 'You are not allowed to update this post.' });
    }

    const updateData = {
      title,
      content,
      featured,
      updated_at: new Date()
    };

    if (categories) {
      updateData.categories = categories;
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: new ObjectId(id), user_id: new ObjectId(req.user.id) },
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedPost) {
      return res.status(404).send({ message: 'Post not found' });
    }
    
    res.status(200).send({ updatedPost });
  } catch (error) {
    console.error('Error updating post:', error.message);
    res.status(500).send({ message: 'Error updating post', error: error.message });
  }
};

// Update the featured status of a post by ID
const updateFeatured = async (req, res) => {
  const { id } = req.params;
  const { featured } = req.body;
  if (!ObjectId.isValid(id)) { 
    return res.status(400).send({ message: 'Invalid post ID' })
  };
  if (featured === undefined || featured === null || featured === '') {
    return res.status(400).send({ message: 'Featured is required' })
  };

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).send({ message: 'You are not allowed to update this post.' });
    }

    const updatedPost = await Post.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { featured } },
      { new: true }
    );
    
    res.status(200).send({ updatedPost });
  } catch (error) {
    console.error('Error updating post:', error.message);
    res.status(500).send({ message: 'Error updating post', error: error.message });
  }
};

// Delete a post by ID
const deletePost = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: 'Invalid post ID' });
  }

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    if (post.user_id.toString() !== req.user.id) {
      return res.status(403).send({ message: 'You are not allowed to delete this post.' });
    }

    await Post.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).send({ message: 'Error deleting post', error: error.message });
  }
};

module.exports = { getAllPosts, getPost, createPost, updatePost, updateFeatured, deletePost };