import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isChatsPage = location.pathname === '/chats';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 md:w-56 lg:w-60 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-full pt-16 md:pt-0">
          <Sidebar onLinkClick={() => setSidebarOpen(false)} />
        </div>
      </div>
      
      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-40 bg-gray-50">
          <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        </div>
        <main
          className={`flex-1 bg-gray-50 ${
            isChatsPage
              ? 'p-0 overflow-hidden'
              : 'p-4 md:p-6 lg:p-8 overflow-y-auto'
          }`}
        >
          <div className="w-full h-full flex flex-col min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
