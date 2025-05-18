import Comment from '../models/Comment.js';

// Create a comment
export const createComment = async (req, res) => {
  try {
    const { content, blogId } = req.body;
    
    const newComment = await Comment.create({
      content,
      blog: blogId,
      author: req.user._id
    });
    
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'username profilePicture')
      .lean();
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get comments for a blog
export const getBlogComments = async (req, res) => {
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .sort({ createdAt: -1 })
      .populate('author', 'username profilePicture')
      .lean();
    
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update comment
export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    comment.content = req.body.content;
    
    const updatedComment = await comment.save();
    
    const populatedComment = await Comment.findById(updatedComment._id)
      .populate('author', 'username profilePicture')
      .lean();
    
    res.status(200).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete comment
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    await comment.deleteOne();
    
    res.status(200).json({ message: 'Comment removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like/unlike comment
export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const isLiked = comment.likes.includes(req.user._id);
    
    if (isLiked) {
      // Unlike comment
      comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      // Like comment
      comment.likes.push(req.user._id);
    }
    
    await comment.save();
    
    res.status(200).json({ 
      likes: comment.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};