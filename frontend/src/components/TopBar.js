import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useDarkMode } from '../contexts/DarkModeContext';
import { MagnifyingGlassIcon, MoonIcon, SunIcon, Bars3Icon } from '@heroicons/react/24/outline';
import NotificationDropdown from './NotificationDropdown';

const TopBar = ({ onMenuClick }) => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="h-16 md:h-18 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6 lg:px-8 transition-colors duration-200">
      {/* Left section - Menu button and logo/brand */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title="Open menu"
        >
          <Bars3Icon className="h-6 w-6 text-gray-600" />
        </button>
        
        {/* App title/brand - hidden on mobile, shown on desktop */}
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">Talent Link</h1>
        </div>
      </div>
      
      {/* Center section - Search or other content (optional) */}
      <div className="flex-1 max-w-2xl mx-8 hidden lg:block">
        {/* You can add a search bar or other content here if needed */}
      </div>
      
      {/* Right section - Profile, notifications, dark mode toggle */}
      <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? (
            <SunIcon className="h-5 w-5 text-gray-600" />
          ) : (
            <MoonIcon className="h-5 w-5 text-gray-600" />
          )}
        </button>

        <div className="relative">
            <NotificationDropdown />
        </div>

        <div className="h-8 w-px bg-gray-200"></div>

        <Link 
          to="/profile" 
          className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 rounded-lg px-2 md:px-3 py-2 transition-colors group"
        >
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">{user?.first_name || user?.username || 'User'}</div>
            <div className="text-xs text-gray-500 uppercase group-hover:text-blue-500 hidden sm:block">{user?.role || 'USER'}</div>
          </div>
          <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold overflow-hidden group-hover:ring-2 group-hover:ring-blue-300 transition-all">
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
