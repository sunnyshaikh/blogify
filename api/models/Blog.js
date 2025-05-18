import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverImage: {
    type: String,
    default: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg'
  },
  tags: [{
    type: String,
    trim: true
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for search
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;