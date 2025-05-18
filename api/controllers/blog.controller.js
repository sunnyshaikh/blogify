import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';

// Create a blog post
export const createBlog = async (req, res) => {
  try {
    const { title, content, coverImage, tags } = req.body;

    const newBlog = await Blog.create({
      title,
      content,
      author: req.user._id,
      coverImage: coverImage || undefined,
      tags: tags || []
    });

    res.status(201).json(newBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all blog posts with pagination
export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const tag = req.query.tag;
    const search = req.query.search;
    
    let query = {};
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username profilePicture')
      .lean();
    
    const total = await Blog.countDocuments(query);
    
    res.status(200).json({
      blogs,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get blog by ID
export const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate('author', 'username profilePicture bio')
      .lean();
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Increment view count
    await Blog.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    // Get comment count
    const commentCount = await Comment.countDocuments({ blog: req.params.id });
    
    res.status(200).json({ ...blog, commentCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the author
    if (blog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }
    
    const { title, content, coverImage, tags } = req.body;
    
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.coverImage = coverImage || blog.coverImage;
    blog.tags = tags || blog.tags;
    
    const updatedBlog = await blog.save();
    
    res.status(200).json(updatedBlog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the author or admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }
    
    await blog.deleteOne();
    
    // Also delete all comments for this blog
    await Comment.deleteMany({ blog: req.params.id });
    
    res.status(200).json({ message: 'Blog removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/unlike blog
export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    const isLiked = blog.likes.includes(req.user._id);
    
    if (isLiked) {
      // Unlike blog
      blog.likes = blog.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like blog
      blog.likes.push(req.user._id);
    }
    
    await blog.save();
    
    res.status(200).json({ 
      likes: blog.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get blogs by user
export const getBlogsByUser = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    const blogs = await Blog.find({ author: userId })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .lean();
    
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};