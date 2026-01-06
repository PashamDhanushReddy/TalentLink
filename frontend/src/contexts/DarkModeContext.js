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