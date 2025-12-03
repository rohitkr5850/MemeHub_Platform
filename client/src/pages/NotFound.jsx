import { Link } from 'react-router-dom';
import { Laugh, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-base-100 p-8 rounded-lg shadow-lg"
      >
        <div className="mb-6">
          <Laugh className="w-24 h-24 mx-auto text-neutral-400" />
          <h1 className="text-3xl font-bold mt-4">404 - Page Not Found</h1>
          <p className="mt-2 text-lg">
            The meme you're looking for has vanished into the internet void.
          </p>
        </div>
        
        <div className="mt-8">
          <Link 
            to="/" 
            className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Homepage
          </Link>
        </div>
        
        <p className="mt-6 text-sm text-gray-500">
          Or maybe create a meme about this 404 page? Just a thought...
        </p>
      </motion.div>
    </div>
  );
};

export default NotFound;