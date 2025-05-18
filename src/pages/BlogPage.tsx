import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/blog/CommentSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Heart, MessageCircle, Eye, Share2, Bookmark, Edit, Trash2 } from 'lucide-react';

interface Author {
  _id: string;
  username: string;
  profilePicture: string;
  bio: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  likes: string[];
  views: number;
  commentCount: number;
}

const BlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/blogs/${id}`);
        setBlog(data);
        
        if (isAuthenticated && user) {
          setIsLiked(data.likes.includes(user._id));
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, isAuthenticated, user]);

  const handleLikeBlog = async () => {
    if (!isAuthenticated || !blog) return;

    try {
      const { data } = await axios.put(`/blogs/${blog._id}/like`);
      setBlog({
        ...blog,
        likes: data.isLiked
          ? [...blog.likes, user!._id]
          : blog.likes.filter((id) => id !== user!._id),
      });
      setIsLiked(data.isLiked);
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleDeleteBlog = async () => {
    if (!blog) return;

    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await axios.delete(`/blogs/${blog._id}`);
        navigate('/');
      } catch (error) {
        console.error('Error deleting blog:', error);
        setError('Failed to delete blog');
      }
    }
  };

  const handleShareBlog = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">
          {error || 'Blog not found'}
        </h2>
        <Link to="/" className="text-blue-700 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Cover Image */}
      <div 
        className="w-full h-72 md:h-96 bg-cover bg-center"
        style={{ backgroundImage: `url(${blog.coverImage})` }}
      >
        <div className="w-full h-full bg-black bg-opacity-40 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="max-w-3xl">
              {blog.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?tag=${tag}`}
                  className="inline-block mr-2 mb-3 px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm text-white rounded-full text-sm hover:bg-opacity-30 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link to={`/profile/${blog.author._id}`}>
                <img
                  src={blog.author.profilePicture}
                  alt={blog.author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              </Link>
              <div>
                <Link
                  to={`/profile/${blog.author._id}`}
                  className="font-medium hover:text-blue-700 transition-colors"
                >
                  {blog.author.username}
                </Link>
                <p className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            {isAuthenticated && user?._id === blog.author._id && (
              <div className="flex space-x-3">
                <Link
                  to={`/edit-blog/${blog._id}`}
                  className="flex items-center gap-1 text-gray-600 hover:text-blue-700 transition-colors"
                >
                  <Edit size={18} />
                  <span className="hidden md:inline">Edit</span>
                </Link>
                <button
                  onClick={handleDeleteBlog}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                  <span className="hidden md:inline">Delete</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between py-4 border-y border-gray-200 mb-8">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLikeBlog}
                disabled={!isAuthenticated}
                className={`flex items-center gap-1.5 ${
                  isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                } transition-colors disabled:opacity-50`}
              >
                <Heart className={isLiked ? 'fill-red-500' : ''} size={20} />
                <span>{blog.likes.length}</span>
                <span className="hidden md:inline">Likes</span>
              </button>
              
              <a
                href="#comments"
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-700 transition-colors"
              >
                <MessageCircle size={20} />
                <span>{blog.commentCount}</span>
                <span className="hidden md:inline">Comments</span>
              </a>
              
              <div className="flex items-center gap-1.5 text-gray-500">
                <Eye size={20} />
                <span>{blog.views}</span>
                <span className="hidden md:inline">Views</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleShareBlog}
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-700 transition-colors"
              >
                <Share2 size={20} />
                <span className="hidden md:inline">Share</span>
              </button>
              
              <button
                disabled={!isAuthenticated}
                className="flex items-center gap-1.5 text-gray-500 hover:text-blue-700 transition-colors disabled:opacity-50"
              >
                <Bookmark size={20} />
                <span className="hidden md:inline">Save</span>
              </button>
            </div>
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Author Box */}
          <div className="mt-16 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-4">
              <Link to={`/profile/${blog.author._id}`}>
                <img
                  src={blog.author.profilePicture}
                  alt={blog.author.username}
                  className="w-16 h-16 rounded-full object-cover"
                />
              </Link>
              <div>
                <h3 className="font-bold text-lg mb-1">
                  Written by{' '}
                  <Link
                    to={`/profile/${blog.author._id}`}
                    className="hover:text-blue-700 transition-colors"
                  >
                    {blog.author.username}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-3">{blog.author.bio || 'No bio available'}</p>
                <Link
                  to={`/profile/${blog.author._id}`}
                  className="text-blue-700 hover:text-blue-800 transition-colors font-medium"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div id="comments" className="mt-16">
            <CommentSection blogId={blog._id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;