import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Squares2X2Icon,
  BanknotesIcon,
  CreditCardIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  CalendarIcon,
  UsersIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = React.useState(false);

  // Load dark mode preference from localStorage on component mount
  React.useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: Squares2X2Icon, path: '/dashboard' },
  ];

  // For clients: Show Freelancers (candidates) and My Projects
  if (user?.role === 'client') {
    menuItems.push({ name: 'Freelancers', icon: UsersIcon, path: '/freelancers' });
    menuItems.push({ name: 'My Projects', icon: BriefcaseIcon, path: '/my-projects' });
  } else {
    // For freelancers: Show Projects Feed
    menuItems.push({ name: 'Projects', icon: BriefcaseIcon, path: '/projects' });
  }

  menuItems.push(
    { name: 'Proposals', icon: DocumentTextIcon, path: '/proposals' },
    { name: 'Contracts', icon: ClipboardDocumentCheckIcon, path: '/contracts' },
    { name: 'Chats', icon: ChatBubbleLeftRightIcon, path: '/chats' },
    { name: 'Calendar', icon: CalendarIcon, path: '/calendar' },
    { name: 'Settings', icon: Cog6ToothIcon, path: '/settings' },
  );

  // Add Clients menu only for non-client users (freelancers might want to see clients)
  if (user?.role !== 'client') {
    // Insert before Settings (last item)
    menuItems.splice(menuItems.length - 1, 0, { name: 'Clients', icon: UsersIcon, path: '/clients' });
  }

  return (
    <div className={`h-screen w-64 ${darkMode ? 'bg-gray-900' : 'bg-[#0B1120]'} text-gray-400 flex flex-col fixed left-0 top-0 overflow-y-auto transition-colors duration-200`}>
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
          TL
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Talent Link</h1>
          <p className="text-xs text-gray-500 font-medium tracking-wider">
            {user?.role === 'client' ? 'CLIENT PORTAL' : 'FREELANCER PORTAL'}
          </p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Menu
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
