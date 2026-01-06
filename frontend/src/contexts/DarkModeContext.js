import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Override system dark mode preference - force app to use its own theme
  useEffect(() => {
    // Remove system dark mode preference detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Override system preference by always starting with light mode unless user explicitly chose dark
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === null) {
      // Only use system preference if no user preference is saved
      setDarkMode(false); // Force light mode by default
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f9fafb';
    }
    
    // Prevent system theme changes from affecting the app
    const handleSystemThemeChange = (e) => {
      // Ignore system theme changes - app should only use its own theme
      console.log('System theme change ignored - app uses its own theme setting');
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      
      // iOS Safari specific: Force repaint and background update
      setTimeout(() => {
        document.body.style.backgroundColor = isDark ? '#0f172a' : '#f9fafb';
        document.body.style.webkitTransform = 'translateZ(0)';
        document.body.style.webkitTransform = '';
      }, 0);
    } else {
      // Default to light mode
      document.body.style.backgroundColor = '#f9fafb';
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
    
    // iOS Safari specific: Force repaint and background update
    setTimeout(() => {
      document.body.style.backgroundColor = newDarkMode ? '#0f172a' : '#f9fafb';
      document.body.style.webkitTransform = 'translateZ(0)';
      document.body.style.webkitTransform = '';
    }, 0);
  };

  const value = {
    darkMode,
    toggleDarkMode,
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
};