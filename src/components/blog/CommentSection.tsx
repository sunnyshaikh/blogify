import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Heart, Edit, Trash2 } from 'lucide-react';

interface Author {
  _id: string;
  username: string;
  profilePicture: string;
}

interface Comment {
  _id: string;
  content: string;
  author: Author;
  blog: string;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

interface CommentSectionProps {
  blogId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ blogId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data } = await axios.get(`/comments/blog/${blogId}`);
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments');
      }
    };

    fetchComments();
  }, [blogId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      const { data } = await axios.post('/comments', {
        content: newComment,
        blogId,
      });
      setComments([data, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
      setError('Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!isAuthenticated) return;

    try {
      const { data } = await axios.put(`/comments/${commentId}/like`);
      
      setComments(
        comments.map((comment) =>
          comment._id === commentId
            ? {
                ...comment,
                likes: data.isLiked
                  ? [...comment.likes, user!._id]
                  : comment.likes.filter((id) => id !== user!._id),
              }
            : comment
        )
      );
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const { data } = await axios.put(`/comments/${commentId}`, {
        content: editContent,
      });
      
      setComments(
        comments.map((comment) =>
          comment._id === commentId ? data : comment
        )
      );
      setEditingComment(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await axios.delete(`/comments/${commentId}`);
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold mb-6">Comments ({comments.length})</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>
      )}
      
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors disabled:bg-blue-300"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-md text-center">
          <p>
            Please{' '}
            <a href="/login" className="text-blue-700 hover:underline">
              log in
            </a>{' '}
            to leave a comment.
          </p>
        </div>
      )}
      
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment._id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-3">
                  <img
                    src={comment.author.profilePicture}
                    alt={comment.author.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{comment.author.username}</h4>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                {isAuthenticated && user?._id === comment.author._id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment)}
                      className="text-gray-500 hover:text-blue-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-gray-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              {editingComment === comment._id ? (
                <div className="mt-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2 mt-2">
                    <button
                      onClick={() => setEditingComment(null)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateComment(comment._id)}
                      className="px-3 py-1 text-sm bg-blue-700 text-white rounded-md hover:bg-blue-800"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-gray-700">{comment.content}</p>
              )}
              
              <div className="mt-3 flex items-center">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className={`flex items-center space-x-1 ${
                    isAuthenticated && comment.likes.includes(user!._id)
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Heart size={16} className={isAuthenticated && comment.likes.includes(user!._id) ? 'fill-red-500' : ''} />
                  <span>{comment.likes.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No comments yet. Be the first to comment!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;