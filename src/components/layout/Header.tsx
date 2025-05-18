import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Menu, X, Search, User, PenTool, LogOut } from "lucide-react";

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setIsMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      setIsMenuOpen(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "backdrop-blur-sm bg-white/80"
      }`}
    >
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-purple-600">
              Blogify
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-blue-700 transition-colors"
            >
              Home
            </Link>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2 pl-10 pr-4 w-64 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </form>

            {isAuthenticated ? (
              <div className="flex items-center space-x-6">
                <Link
                  to="/create-blog"
                  className="flex items-center gap-1 text-white bg-blue-700 hover:bg-blue-800 py-2 px-4 rounded-full transition-colors"
                >
                  <PenTool size={18} />
                  <span>Write</span>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2">
                    <img
                      src={user?.profilePicture}
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover border-2 border-blue-100"
                    />
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                    <div className="py-2">
                      <Link
                        to={`/profile/${user?._id}`}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </Link>

                      <Link
                        to="/edit-profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <User size={16} className="mr-2" />
                        Edit Profile
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-blue-700 hover:text-blue-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-white bg-blue-700 hover:bg-blue-800 py-2 px-4 rounded-full transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="text-gray-700 hover:text-blue-700 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </form>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-blog"
                    className="flex items-center gap-2 text-blue-700 hover:text-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PenTool size={18} />
                    Write a blog
                  </Link>

                  <Link
                    to={`/profile/${user?._id}`}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    Profile
                  </Link>

                  <Link
                    to="/edit-profile"
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User size={18} />
                    Edit Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-blue-700 transition-colors"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    className="text-blue-700 hover:text-blue-800 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-center text-white bg-blue-700 hover:bg-blue-800 py-2 px-4 rounded-full transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
