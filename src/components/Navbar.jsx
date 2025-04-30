import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function Navbar() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-200 dark:bg-gray-800 dark:text-white shadow-lg">
      {/* Logo */}
      <div className="text-4xl font-extrabold text-gray-800 dark:text-white">
        OVS
      </div>

      {/* Links */}
      <div className="flex gap-6 items-center">
        <Link to="/" className="text-lg font-medium hover:text-blue-500 transition">
          Home
        </Link>
        <Link to="/elections" className="text-lg font-medium hover:text-blue-500 transition">
          Elections
        </Link>
        {/* <Link to="/admin" className="text-lg font-medium hover:text-blue-500 transition">
          Admin
        </Link> */}

        {/* Dark/Light Mode Toggle */}
        {/* <button
          onClick={() => setDark((prev) => !prev)}
          className="text-2xl p-2 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {dark ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-700" />}
        </button> */}
      </div>
    </nav>
  );
}
