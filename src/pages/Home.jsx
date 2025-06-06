import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h1
        className="text-4xl font-bold mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Welcome to the Online Voting System
      </motion.h1>

      <motion.p
        className="mb-8 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Secure, fast, and transparent digital elections.
      </motion.p>

      <motion.div
        className="flex gap-4 flex-wrap justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Link
          to="/login"
          aria-label="Go to login page"
          className="px-6 py-2 rounded-md bg-white text-black border border-black font-medium hover:bg-black hover:text-white hover:border-black transition dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-white"
        >
          Login
        </Link>
        <Link
          to="/register"
          aria-label="Go to register page"
          className="px-6 py-2 rounded-md bg-black text-white font-medium hover:bg-white hover:text-black hover:border hover:border-black transition dark:hover:bg-gray-800 dark:hover:text-white dark:hover:border-white"
        >
          Register
        </Link>
      </motion.div>
    </motion.div>
  );
}
