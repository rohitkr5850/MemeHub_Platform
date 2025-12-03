import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  Laugh,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

/*SP*/
function useClickOutside(ref, callback) {
  useEffect(() => {
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
}

/*Nav*/
const mainNavLinks = [
  { to: "/", children: "Home" },
  { to: "/leaderboard", children: "Leaderboard" },
  { to: "/create", children: "Create" },
];

const userDropdownLinks = [
  { to: "/dashboard", children: "Dashboard", icon: User },
  { to: "/profile", children: "Edit Profile", icon: Settings },
];

/*SP*/
const NavLogo = () => (
  <Link to="/" className="flex items-center group" aria-label="MemeHub Home">
    <Laugh className="h-8 w-8 sm:h-9 sm:w-9 mr-2 text-primary-500 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
    <span className="font-display font-bold text-2xl sm:text-3xl bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
      MemeHub
    </span>
  </Link>
);

const NavLinkItem = ({ to, children, onClick, className = "" }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`px-3 py-2 rounded-md text-base sm:text-lg font-medium transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md"
          : "hover:bg-base-300 focus:bg-base-300"
      } ${className}`}
    >
      {children}
    </Link>
  );
};

const DropdownLinkItem = ({
  to,
  children,
  onClick,
  icon: Icon,
  className = "",
  isDanger = false,
}) => (
  <Link
    to={to || "#"}
    onClick={onClick}
    role="menuitem"
    tabIndex={0}
    className={`block px-4 py-2 text-sm transition-colors w-full text-left rounded-md ${
      isDanger
        ? "text-error-500 hover:bg-error-50 hover:text-error-600"
        : "hover:bg-base-300 focus:bg-base-300"
    } ${className}`}
  >
    <div className="flex items-center">
      {Icon && <Icon size={16} className="mr-3" />}
      <span>{children}</span>
    </div>
  </Link>
);

const ThemeToggle = ({ isDarkMode, toggleDarkMode }) => (
  <button
    onClick={toggleDarkMode}
    className="p-2 rounded-full hover:bg-base-300 focus:bg-base-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-transform duration-300"
    aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
  >
    {isDarkMode ? (
      <Sun size={22} className="transform rotate-180 transition-transform duration-300" />
    ) : (
      <Moon size={22} className="transform rotate-180 transition-transform duration-300" />
    )}
  </button>
);

/*User-DropDown*/
const UserProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useClickOutside(dropdownRef, () => isOpen && setIsOpen(false));

  const handleToggle = () => setIsOpen((s) => !s);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      const firstItem = dropdownRef.current?.querySelector('[role="menuitem"]');
      firstItem?.focus?.();
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="user-menu"
        className="flex items-center space-x-2 px-2 py-1 rounded-md hover:bg-base-300 focus:bg-base-300 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      >
        <span className="hidden sm:inline text-sm font-medium">
          {user?.username}
        </span>
        <div className="relative w-8 h-8 sm:w-9 sm:h-9">
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={`${user.username}'s profile`}
              className="w-full h-full rounded-full object-cover border-2 border-primary-500 shadow-md"
            />
          ) : (
            <span className="w-full h-full flex items-center justify-center rounded-full bg-primary-500 text-white font-semibold">
              {user?.username?.charAt(0)?.toUpperCase()}
            </span>
          )}
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></span>
        </div>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="user-menu"
          role="menu"
          className="absolute right-0 mt-2 w-56 py-2 bg-base-100/95 backdrop-blur-md rounded-md shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 origin-top-right animate-[fadeInScale_0.2s_ease-out]"
        >
          <div className="px-4 py-3 border-b border-base-300">
            <p className="text-sm font-medium truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>

          {userDropdownLinks.map((link) => {
            const Icon = link.icon;
            return (
              <DropdownLinkItem
                key={link.to}
                to={link.to}
                icon={Icon}
                onClick={() => setIsOpen(false)}
              >
                {link.children}
              </DropdownLinkItem>
            );
          })}

          <div className="pt-1 border-t border-base-300">
            <DropdownLinkItem
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              icon={LogOut}
              isDanger={true}
            >
              Logout
            </DropdownLinkItem>
          </div>
        </div>
      )}
    </div>
  );
};

/* ----------------------------
   Main Navbar
   ---------------------------- */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("mh-theme") === "dark";
    }
    return false;
  });
  const [isScrolled, setIsScrolled] = useState(false);

  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

    useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDarkMode ? "memeHubDark" : "memehub"
    );
    localStorage.setItem("mh-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((p) => !p);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((s) => !s);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen && mobileMenuRef.current) {
      const focusableElements = mobileMenuRef.current.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      focusableElements[0]?.focus?.();
    }
  }, [isMobileMenuOpen]);

  useClickOutside(mobileMenuRef, () => {
    setIsMobileMenuOpen(false);
  });

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ease-in-out ${
        isScrolled || isMobileMenuOpen
          ? "bg-base-100/80 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <NavLogo />

          {/* Desktop Navigation */}
          <nav
            role="navigation"
            aria-label="Main Navigation"
            className="hidden lg:flex items-center space-x-2"
          >
            {mainNavLinks.map((link) => (
              <NavLinkItem key={link.to} to={link.to}>
                {link.children}
              </NavLinkItem>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            <ThemeToggle
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
            {isAuthenticated && user ? (
              <UserProfileDropdown user={user} onLogout={handleLogout} />
            ) : (
              <>
                <NavLinkItem to="/login" className="text-sm">
                  Login
                </NavLinkItem>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-md"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <ThemeToggle
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
            />
            <button
              onClick={toggleMobileMenu}
              className="ml-2 inline-flex items-center justify-center p-2 rounded-md hover:bg-base-300 focus:bg-base-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors"
              aria-controls="mobile-menu"
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen ? "Close main menu" : "Open main menu"
              }
            >
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

     {/* Mobile menu */}
{isMobileMenuOpen && (
  <div
    id="mobile-menu"
    className="lg:hidden absolute top-full left-0 right-0 bg-base-100/95 backdrop-blur-md shadow-xl rounded-b-xl animate-[slideIn_0.3s_ease-out] z-30"
    ref={mobileMenuRef}
    role="dialog"
    aria-modal="true"
  >
    {/* Main nav links */}
    <div className="px-4 pt-4 pb-3 space-y-2">
      {mainNavLinks.map((link) => (
        <NavLinkItem
          key={`mobile-${link.to}`}
          to={link.to}
          onClick={toggleMobileMenu}
          className="block w-full text-left text-base font-medium rounded-md px-3 py-2 hover:bg-base-200 transition-colors"
        >
          {link.children}
        </NavLinkItem>
      ))}
    </div>

    {/* Divider */}
    <div className="border-t border-base-300 my-2"></div>

    {/* User section */}
    <div className="px-4 pb-4">
      {isAuthenticated && user ? (
        <>
          {/* Profile header */}
          <div className="flex items-center mb-4">
            <div className="relative w-12 h-12 mr-3">
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-500 shadow-md"
                />
              ) : (
                <span className="w-12 h-12 flex items-center justify-center rounded-full bg-primary-500 text-white text-lg font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <div className="text-base font-semibold">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>

          {/* Dropdown links */}
          <div className="space-y-2">
            {userDropdownLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLinkItem
                  key={`mobile-user-${link.to}`}
                  to={link.to || "#"}
                  onClick={toggleMobileMenu}
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium hover:bg-base-200 transition-colors"
                >
                  {Icon && <Icon size={18} className="mr-2" />}
                  {link.children}
                </NavLinkItem>
              );
            })}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-error-500 hover:bg-error-50 transition-colors"
            >
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <NavLinkItem
            to="/login"
            onClick={toggleMobileMenu}
            className="block w-full text-left px-3 py-2 rounded-md text-base font-medium hover:bg-base-200 transition-colors"
          >
            Login
          </NavLinkItem>
          <Link
            to="/register"
            onClick={toggleMobileMenu}
            className="block w-full text-center px-4 py-2 rounded-md text-base font-medium bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:opacity-90 transition-all shadow-md"
          >
            Sign Up
          </Link>
        </div>
      )}
    </div>
  </div>
)}

    </header>
  );
};

export default Navbar;
