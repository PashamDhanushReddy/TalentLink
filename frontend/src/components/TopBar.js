import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MagnifyingGlassIcon, MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/outline';
import NotificationDropdown from './NotificationDropdown';

const TopBar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
    }
  }, []);

  // Handle dark mode toggle
  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10 transition-colors duration-200">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="Open menu"
      >
        <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
      </button>
      
      <div className="flex items-center gap-4 md:gap-6">
        <button
          onClick={handleDarkModeToggle}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        <div className="relative">
            <NotificationDropdown />
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-600"></div>

        <Link 
          to="/profile" 
          className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 rounded-lg px-2 md:px-3 py-2 transition-colors group"
        >
          <div className="text-right hidden lg:block">
            <div className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">{user?.first_name || user?.username || 'User'}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase group-hover:text-blue-500">{user?.role || 'USER'}</div>
          </div>
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold overflow-hidden group-hover:ring-2 group-hover:ring-blue-300 transition-all">
             {user?.avatar ? (
                <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
             ) : (
                <span>{(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}</span>
             )}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default TopBar;
