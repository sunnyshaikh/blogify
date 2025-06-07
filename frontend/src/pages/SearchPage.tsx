import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/blog/BlogCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Search, Tag, X } from 'lucide-react';

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

interface BlogsResponse {
  blogs: Blog[];
  currentPage: number;
  totalPages: number;
  totalBlogs: number;
}

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') || '');
  const [popularTags, setPopularTags] = useState<string[]>([]);

  useEffect(() => {
    const q = searchParams.get('q');
    const tag = searchParams.get('tag');
    
    if (q) setSearchTerm(q);
    if (tag) setActiveTag(tag);
    
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        
        const params: Record<string, string | number> = { page, limit: 12 };
        if (q) params.search = q;
        if (tag) params.tag = tag;
        
        const { data } = await axios.get<BlogsResponse>('/blogs', { params });
        
        setBlogs(data.blogs);
        setTotalPages(data.totalPages);
        setTotalResults(data.totalBlogs);
        
        // Extract unique tags from blogs if not already set
        if (popularTags.length === 0) {
          const allTags = data.blogs.flatMap(blog => blog.tags);
          const tagCounts = allTags.reduce((acc, tag) => {
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          // Sort tags by frequency
          const sortedTags = Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag)
            .slice(0, 15);
          
          setPopularTags(sortedTags);
        }
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [searchParams, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = {};
    if (searchTerm) params.q = searchTerm;
    if (activeTag) params.tag = activeTag;
    setSearchParams(params);
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    setActiveTag(tag);
    setSearchTerm('');
    setSearchParams({ tag });
    setPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setActiveTag('');
    setSearchParams({});
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Blogs</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, content, or tags..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Search
          </button>
          {(searchTerm || activeTag) && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </form>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 md:order-1 order-2">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Tag size={18} />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      activeTag === tag
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="w-full md:w-3/4 md:order-2 order-1">
          {loading && <LoadingSpinner />}
          
          {!loading && (
            <>
              <div className="mb-6">
                {(searchTerm || activeTag) && (
                  <div className="flex items-center mb-4">
                    <span className="text-gray-600 mr-2">Filters:</span>
                    {searchTerm && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2">
                        {searchTerm}
                      </span>
                    )}
                    {activeTag && (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        <Tag size={14} />
                        {activeTag}
                      </span>
                    )}
                  </div>
                )}
                
                <p className="text-gray-600">
                  {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
              )}

              {blogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <BlogCard key={blog._id} blog={blog} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500 mb-4">No blogs found matching your search criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                  >
                    Clear Filters
                  </button>
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
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;