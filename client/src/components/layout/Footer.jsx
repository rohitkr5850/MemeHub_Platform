import { Laugh, Heart, Twitter, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="bg-base-300 pt-16 pb-10 relative">

      {/* ✨ Gradient Top Line */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-primary to-secondary"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Section */}
          <div className="space-y-4 text-center md:text-left">

            {/* Logo */}
            <div className="flex items-center justify-center md:justify-start">
              <Laugh className="h-7 w-7 mr-2 text-primary" />
              <span className="font-display font-bold text-xl text-primary">
                MemeHub
              </span>
            </div>

            {/* About Text */}
            <p className="text-sm opacity-80 leading-relaxed">
              The home of creativity and fun — create, share, and track trending memes across the world.
            </p>

            {/* Social Icons */}
            <div className="flex justify-center md:justify-start space-x-3 mt-3">
              {[Twitter, Facebook, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className="p-2 rounded-xl bg-base-100 hover:bg-primary hover:text-white 
                             transition-all shadow-sm hover:shadow-xl hover:scale-105"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-lg mb-4 text-primary">Navigation</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><Link to="/" className="hover:text-primary transition-all">Home</Link></li>
              <li><Link to="/leaderboard" className="hover:text-primary transition-all">Leaderboard</Link></li>
              <li><Link to="/create" className="hover:text-primary transition-all">Create Meme</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-lg mb-4 text-primary">Account</h3>
            <ul className="space-y-2 text-sm opacity-90">

              {/* 🔥 Hide Login / Signup when logged in */}
              {!isAuthenticated && (
                <>
                  <li><Link to="/login" className="hover:text-primary transition-all">Login</Link></li>
                  <li><Link to="/register" className="hover:text-primary transition-all">Sign Up</Link></li>
                </>
              )}

              {/* 🔥 Show Dashboard only when logged in */}
              {isAuthenticated && (
                <li><Link to="/dashboard" className="hover:text-primary transition-all">Dashboard</Link></li>
              )}

            </ul>
          </div>

          {/* Legal */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-lg mb-4 text-primary">Legal</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li><a className="hover:text-primary cursor-pointer transition-all">Terms of Service</a></li>
              <li><a className="hover:text-primary cursor-pointer transition-all">Privacy Policy</a></li>
              <li><a className="hover:text-primary cursor-pointer transition-all">Cookie Policy</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="mt-14 pt-6 border-t border-base-content/10 flex flex-col md:flex-row justify-between items-center gap-3">

          <p className="text-sm opacity-70 text-center md:text-left">
            &copy; {currentYear} MemeHub — All Rights Reserved.
          </p>

          <p className="text-sm opacity-70 flex items-center">
            Crafted with
            <Heart className="h-4 w-4 mx-1 text-secondary animate-pulse" />
            by Meme Enthusiast Rohit
          </p>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
