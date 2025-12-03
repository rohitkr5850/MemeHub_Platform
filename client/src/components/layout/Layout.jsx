import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { motion } from 'framer-motion';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-base-100 text-neutral">
      {/* Top Navigation */}
      <Navbar />

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="
          flex-grow 
          w-full 
          px-4 py-6 
          sm:px-6 lg:px-8 
          bg-base-100
        "
      >
        {/*Wrapper*/}
        <div className="max-w-5xl mx-auto w-full">
          <Outlet />
        </div>
      </motion.main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
