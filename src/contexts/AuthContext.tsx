import { createContext, useState, useCallback, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '../config/constants';

interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: string;
}

interface DecodedToken {
  userId: string;
  username: string;
  email: string;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  checkAuth: async () => false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthToken = (token: string) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      Cookies.set('mh_token', token, { expires: 7 });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      Cookies.remove('mh_token');
    }
  };

  const checkAuth = useCallback(async () => {
    const token = Cookies.get('mh_token');
    
    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return false;
    }

    try {
      // Check if token is expired
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        // Token expired
        setAuthToken('');
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      // Token is valid, set auth header
      setAuthToken(token);
      
      // Get user data
      const response = await axios.get(`${API_URL}/api/users/me`);
      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      setAuthToken('');
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      const { token, user } = response.data;
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password,
      });
      
      const { token, user } = response.data;
      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken('');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};