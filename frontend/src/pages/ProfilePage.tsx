import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CalendarDays, PenTool, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  role: string;
  createdAt: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  author: {
    _id: string;
    username: string;
    profilePicture: string;
  };
  createdAt: string;
  tags: string[];
  likes: string[];
  views: number;
}

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const { data: userData } = await axios.get(`/users/${userId}`);
        setUser(userData);
        
        // Fetch user's blogs
        const { data: userBlogs } = await axios.get(`/blogs/user/${userId}`);
        setBlogs(userBlogs);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const isCurrentUser = currentUser && user && currentUser._id === user._id;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">
          {error || 'User not found'}
        </h2>
        <Link to="/" className="text-blue-700 hover:underline">
          Return to homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10">
        <div className="bg-gradient-to-r from-blue-900 to-purple-800 h-32"></div>
        <div className="px-6 py-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-24 h-24 rounded-full border-4 border-white absolute -top-12 left-6 shadow-md object-cover"
            />
            <div className="mt-14 md:mt-0 md:ml-28">
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <CalendarDays size={16} className="mr-1" />
                <span>Joined {format(new Date(user.createdAt), 'MMMM yyyy')}</span>
              </div>
            </div>
            
            {isCurrentUser && (
              <div className="md:ml-auto">
                <Link
                  to="/edit-profile"
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit size={16} />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 max-w-2xl">
            <p className="text-gray-700">
              {user.bio || 'No bio available'}
            </p>
          </div>
        </div>
      </div>

      {/* User's Blogs */}
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <PenTool size={24} />
        <span>{isCurrentUser ? 'Your Blogs' : `${user.username}'s Blogs`}</span>
      </h2>
      
      {blogs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog._id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <p className="text-gray-500 mb-4">
            {isCurrentUser
              ? "You haven't published any blogs yet."
              : `${user.username} hasn't published any blogs yet.`}
          </p>
          {isCurrentUser && (
            <Link
              to="/create-blog"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
            >
              <PenTool size={16} />
              Write Your First Blog
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;