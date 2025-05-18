import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BlogCardProps {
  blog: {
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
    commentCount?: number;
  };
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
  const {
    _id,
    title,
    content,
    coverImage,
    author,
    createdAt,
    tags,
    likes,
    views,
    commentCount = 0
  } = blog;

  // Truncate content for preview
  const truncatedContent = 
    content.length > 150 ? content.substring(0, 150) + '...' : content;

  // Format date
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
      <Link to={`/blog/${_id}`}>
        <img 
          src={coverImage} 
          alt={title} 
          className="w-full h-48 object-cover"
        />
      </Link>
      
      <div className="p-6">
        <div className="mb-3">
          {tags.map(tag => (
            <Link 
              key={tag} 
              to={`/search?tag=${tag}`}
              className="inline-block text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
            >
              {tag}
            </Link>
          ))}
        </div>
        
        <Link to={`/blog/${_id}`}>
          <h2 className="text-xl font-bold mb-2 hover:text-blue-700 transition-colors">
            {title}
          </h2>
        </Link>
        
        <p className="text-gray-600 mb-4">
          {truncatedContent}
        </p>
        
        <div className="flex justify-between items-center mb-4">
          <Link to={`/profile/${author._id}`} className="flex items-center gap-2">
            <img 
              src={author.profilePicture} 
              alt={author.username} 
              className="w-8 h-8 rounded-full object-cover" 
            />
            <span className="text-sm font-medium">{author.username}</span>
          </Link>
          
          <span className="text-xs text-gray-500">{formattedDate}</span>
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1">
            <Heart size={14} className="text-gray-400" />
            <span>{likes.length}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <MessageCircle size={14} className="text-gray-400" />
            <span>{commentCount}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Eye size={14} className="text-gray-400" />
            <span>{views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;