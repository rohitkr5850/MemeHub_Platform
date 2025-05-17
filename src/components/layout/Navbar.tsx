import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Laugh, Moon, Sun, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll event to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.setAttribute(
      'data-theme',
      newMode ? 'memeHubDark' : 'memehub'
    );
    localStorage.setItem('mh-theme', newMode ? 'dark' : 'light');
  };

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('mh-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'memeHubDark');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-200 ${
        isScrolled
          ? 'bg-base-100 shadow-md'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Laugh className="h-8 w-8 mr-2 text-primary-500" />
            <span className="font-display font-bold text-3xl text-primary-500">MemeHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 rounded-md text-lg font-bold hover:bg-base-300 transition-colors">
              Home
            </Link>
            <Link to="/leaderboard" className="px-3 py-2 rounded-md text-lg font-bold hover:bg-base-300 transition-colors">
              Leaderboard
            </Link>
            <Link to="/create" className="px-3 py-2 rounded-md text-lg font-bold hover:bg-base-300 transition-colors">
              Create
            </Link>
          </nav>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-base-300 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-base-300 transition-colors">
                  <span>{user?.username}</span>
                  <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                    {user?.profilePicture ? (
                      <img src={user.profilePicture} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span>{user?.username.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 py-2 bg-base-100 rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm hover:bg-base-300 transition-colors">
                    <div className="flex items-center">
                      <User size={16} className="mr-2" />
                      <span>Dashboard</span>
                    </div>
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-base-300 transition-colors">
                    <div className="flex items-center">
                      <Settings size={16} className="mr-2" />
                      <span>Edit Profile</span>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-base-300 transition-colors"
                  >
                    <div className="flex items-center text-error-500">
                      <LogOut size={16} className="mr-2" />
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 rounded-md text-sm font-medium hover:bg-base-300 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="px-4 py-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:bg-base-300 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-base-100 shadow-lg">
          <Link
            to="/"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-base-300 transition-colors"
          >
            Home
          </Link>
          <Link
            to="/leaderboard"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-base-300 transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            to="/create"
            className="block px-3 py-2 rounded-md text-base font-medium hover:bg-base-300 transition-colors"
          >
            Create
          </Link>
          
          <div className="pt-4 pb-3 border-t border-base-300">
            <div className="flex items-center justify-between px-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-base-300 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span className="\nml-2">{isDarkMode ? '' : ''}</span>
              </button>
            </div>
          </div>
          
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-base-300">
              <div className="flex items-center px-3">
                <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white mr-3">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.username} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="text-lg">{user?.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="text-base font-medium">{user?.username}</div>
                  <div className="text-sm font-medium opacity-75">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-base-300 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-base-300 transition-colors"
                >
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-error-500 hover:bg-base-300 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-base-300 space-y-1">
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-base-300 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors mx-2"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;