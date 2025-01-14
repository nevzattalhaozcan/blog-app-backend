const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: { type: String, required: true},
  content: { type: String, required: true},
  featured: { type: Boolean, default: false },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);