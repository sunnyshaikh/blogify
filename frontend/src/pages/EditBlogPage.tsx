import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlogForm from '../components/blog/BlogForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

const EditBlogPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/blogs/${id}`);
        
        // Check if the current user is the author
        if (data.author._id !== user?._id) {
          navigate('/');
          return;
        }
        
        setBlog(data);
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
  }, [id, user, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-red-700 mb-4">{error}</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-blue-700 hover:underline"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Edit Blog</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {blog && (
            <BlogForm
              initialData={{
                title: blog.title,
                content: blog.content,
                coverImage: blog.coverImage,
                tags: blog.tags,
              }}
              isEditing={true}
              blogId={id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditBlogPage;