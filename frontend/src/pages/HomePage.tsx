import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PenTool, Bookmark, TrendingUp } from 'lucide-react';

interface Author {
  _id: string;
  username: string;
  profilePicture: string;
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  coverImage: string;
  author: Author;
  createdAt: string;
  tags: string[];
  likes: string[];
  views: number;
  commentCount: number;
}

interface BlogsResponse {
  blogs: Blog[];
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
}

const HomePage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState('latest');
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get<BlogsResponse>('/blogs', {
          params: { page, limit: 9 },
        });
        setBlogs(data.blogs);
        setTotalPages(data.totalPages);
        
        // Extract unique tags from blogs
        const allTags = data.blogs.flatMap(blog => blog.tags);
        const tagCounts = allTags.reduce((acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        // Sort tags by frequency
        const sortedTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([tag]) => tag)
          .slice(0, 10);
        
        setPopularTags(sortedTags);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [page, activeTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && page === 1) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-900 to-purple-800 rounded-xl overflow-hidden">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Share Your Ideas With The World
              </h1>
              <p className="text-blue-100 text-lg mb-8">
                Join our community of writers and readers. Create, share, and discover
                insightful articles on topics that matter to you.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/create-blog"
                  className="px-6 py-3 bg-white text-blue-800 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <PenTool size={18} />
                  Start Writing
                </Link>
                <Link
                  to="/search"
                  className="px-6 py-3 bg-blue-700 text-white rounded-full font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
                >
                  <Bookmark size={18} />
                  Explore Blogs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-8">
        <main className="w-full md:w-3/4">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              className={`pb-2 px-4 ${
                activeTab === 'latest'
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('latest')}
            >
              Latest
            </button>
            <button
              className={`pb-2 px-4 ${
                activeTab === 'trending'
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('trending')}
            >
              <div className="flex items-center gap-1">
                <TrendingUp size={16} />
                <span>Trending</span>
              </div>
            </button>
          </div>

          {/* Blogs Grid */}
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <BlogCard key={blog._id} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No blogs found.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-10">
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      pageNum === page
                        ? 'bg-blue-700 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </main>

        <aside className="w-full md:w-1/4">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <Link
                  key={tag}
                  to={`/search?tag=${tag}`}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-800 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-4">Join Our Community</h3>
              <p className="text-gray-600 mb-4">
                Share your knowledge and connect with other writers and readers.
              </p>
              <Link
                to="/register"
                className="block w-full py-2 px-4 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-center transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default HomePage;