import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';
  axios.defaults.withCredentials = true;

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data } = await axios.get('/auth/me');
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post('/auth/login', { email, password });
      setUser(data);
    } catch (error) {
      throw error;
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const { data } = await axios.post('/auth/register', { username, email, password });
      setUser(data);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};