import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { X, Plus } from 'lucide-react';

interface BlogFormProps {
  initialData?: {
    title: string;
    content: string;
    coverImage: string;
    tags: string[];
  };
  isEditing?: boolean;
  blogId?: string;
}

interface FormData {
  title: string;
  content: string;
  coverImage: string;
  tag: string;
}

const BlogForm: React.FC<BlogFormProps> = ({ initialData, isEditing = false, blogId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      coverImage: initialData?.coverImage || '',
      tag: '',
    },
  });

  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const watchTag = watch('tag');

  const handleAddTag = () => {
    if (watchTag && !tags.includes(watchTag)) {
      setTags([...tags, watchTag]);
      reset({ ...watch(), tag: '' });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');
      
      const blogData = {
        title: data.title,
        content: data.content,
        coverImage: data.coverImage,
        tags,
      };
      
      let response;
      
      if (isEditing && blogId) {
        response = await axios.put(`/blogs/${blogId}`, blogData);
      } else {
        response = await axios.post('/blogs', blogData);
      }
      
      navigate(`/blog/${response.data._id}`);
    } catch (error) {
      console.error('Error submitting blog:', error);
      setError('Failed to save blog. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md">{error}</div>
      )}
      
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Blog Title*
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter your blog title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
          Cover Image URL
        </label>
        <input
          id="coverImage"
          type="text"
          {...register('coverImage')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter cover image URL"
        />
        {watch('coverImage') && (
          <div className="mt-2">
            <img
              src={watch('coverImage')}
              alt="Cover preview"
              className="h-40 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg';
              }}
            />
          </div>
        )}
      </div>
      
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
          Blog Content*
        </label>
        <textarea
          id="content"
          {...register('content', { required: 'Content is required' })}
          rows={12}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.content ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Write your blog content here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex">
          <input
            id="tag"
            type="text"
            {...register('tag')}
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add tags"
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 bg-blue-700 text-white rounded-r-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus size={16} />
          </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map(tag => (
            <div
              key={tag}
              className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-blue-700 hover:text-blue-900 focus:outline-none"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-400"
        >
          {loading ? 'Saving...' : isEditing ? 'Update Blog' : 'Publish Blog'}
        </button>
      </div>
    </form>
  );
};

export default BlogForm;