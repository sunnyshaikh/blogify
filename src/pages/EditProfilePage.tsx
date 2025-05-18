import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save, ShieldAlert } from 'lucide-react';

interface ProfileFormData {
  username: string;
  email: string;
  bio: string;
  profilePicture: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EditProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordMode, setPasswordMode] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      profilePicture: user?.profilePicture || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const watchProfilePicture = watch('profilePicture');
  const watchNewPassword = watch('newPassword');

  const onSubmitProfile = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      const { data: updatedUser } = await axios.put('/users/profile', {
        username: data.username,
        email: data.email,
        bio: data.bio,
        profilePicture: data.profilePicture,
      });
      
      updateUser(updatedUser);
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: ProfileFormData) => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      
      await axios.put('/users/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      setSuccessMessage('Password updated successfully!');
    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        
        <div className="mb-6 flex space-x-4">
          <button
            className={`px-4 py-2 rounded-lg focus:outline-none ${
              !passwordMode
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setPasswordMode(false)}
          >
            Profile Information
          </button>
          <button
            className={`px-4 py-2 rounded-lg focus:outline-none ${
              passwordMode
                ? 'bg-blue-700 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            onClick={() => setPasswordMode(true)}
          >
            Change Password
          </button>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
            {successMessage}
          </div>
        )}
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {!passwordMode ? (
            <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-6">
              <div>
                <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture URL
                </label>
                <input
                  id="profilePicture"
                  type="text"
                  {...register('profilePicture')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                {watchProfilePicture && (
                  <div className="mt-2">
                    <img
                      src={watchProfilePicture}
                      alt="Profile preview"
                      className="h-16 w-16 rounded-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters long',
                    },
                    maxLength: {
                      value: 20,
                      message: 'Username must be no more than 20 characters long',
                    },
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  {...register('bio', {
                    maxLength: {
                      value: 200,
                      message: 'Bio must be no more than 200 characters long',
                    },
                  })}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.bio ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  {watch('bio')?.length || 0}/200 characters
                </p>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/profile/${user?._id}`)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-400 flex items-center gap-2"
                >
                  <Save size={16} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-md flex items-start gap-3 mb-4">
                <ShieldAlert className="mt-0.5 flex-shrink-0" size={20} />
                <p className="text-sm">
                  Changing your password will log you out from all other devices. 
                  Make sure to use a strong, unique password.
                </p>
              </div>
              
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  {...register('currentPassword', {
                    required: 'Current password is required',
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  {...register('newPassword', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long',
                    },
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your new password',
                    validate: value => value === watchNewPassword || 'Passwords do not match',
                  })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setPasswordMode(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:bg-blue-400"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;