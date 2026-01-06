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
      // Update body background color based on dark mode
      document.body.classList.toggle('bg-gray-50', !isDark);
      document.body.classList.toggle('bg-gray-900', isDark);
    } else {
      // Default to light mode
      document.body.classList.add('bg-gray-50');
      document.body.classList.remove('bg-gray-900');
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
    // Update body background color based on dark mode
    document.body.classList.toggle('bg-gray-50', !newDarkMode);
    document.body.classList.toggle('bg-gray-900', newDarkMode);
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