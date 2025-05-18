import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <h1 className="text-7xl font-bold text-blue-700 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;