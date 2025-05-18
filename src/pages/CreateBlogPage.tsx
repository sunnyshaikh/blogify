import React from 'react';
import BlogForm from '../components/blog/BlogForm';

const CreateBlogPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a New Blog</h1>
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <BlogForm />
        </div>
      </div>
    </div>
  );
};

export default CreateBlogPage;