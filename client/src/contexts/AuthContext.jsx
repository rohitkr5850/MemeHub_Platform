import { createContext, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../config/constants";

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  googleLogin: async () => {},
  logout: () => {},
  checkAuth: async () => false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      Cookies.set("mh_token", token, { expires: 7 });
    } else {
      delete axios.defaults.headers.common["Authorization"];
      Cookies.remove("mh_token");
    }
  };

  const checkAuth = useCallback(async () => {
    const token = Cookies.get("mh_token");

    if (!token) {
      setIsLoading(false);
      setIsAuthenticated(false);
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        setAuthToken("");
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }

      setAuthToken(token);

      const response = await axios.get(`${API_URL}/api/users/me`);
      setUser(response.data);
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthToken("");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return false;
    }
  }, []);

  const login = async (email, password) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username, email, password) => {
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
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (googleToken) => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/google`, {
        token: googleToken,
      });

      const { token, user } = response.data;

      setAuthToken(token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Google Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAuthToken("");
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
        googleLogin,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
