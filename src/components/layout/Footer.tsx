import { Laugh, Heart, Twitter, Facebook, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-300 pt-10 pb-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <Laugh className="h-6 w-6 mr-2 text-primary-500" />
              <span className="font-display font-bold text-lg text-primary-500">MemeHub</span>
            </div>
            <p className="text-sm">
              The internet's playground for memes. Create, share, and track viral memes all in one place.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral hover:text-primary-500 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral hover:text-primary-500 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral hover:text-primary-500 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-primary-500 transition-colors">Leaderboard</Link>
              </li>
              <li>
                <Link to="/create" className="hover:text-primary-500 transition-colors">Create</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="hover:text-primary-500 transition-colors">Login</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary-500 transition-colors">Sign Up</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-primary-500 transition-colors">Dashboard</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-lg mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-500 transition-colors">Cookie Policy</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-base-content/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            &copy; {currentYear} MemeHub. All rights reserved.
          </p>
          <p className="text-sm mt-2 md:mt-0 flex items-center">
            Made with <Heart className="h-4 w-4 mx-1 text-secondary-500" /> by Meme Enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;