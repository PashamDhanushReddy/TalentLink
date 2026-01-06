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
    // Force light mode by completely ignoring system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === null) {
      // Default to light mode, ignore system completely
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
    }
    
    // Block system theme detection completely
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      // Completely ignore system theme changes
      console.log('System theme change blocked - app uses its own theme');
      // Force light mode if system tries to change
      if (!darkMode) {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        document.body.style.backgroundColor = '#f9fafb';
        document.body.style.color = '#111827';
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [darkMode]);

  // Load dark mode preference from localStorage on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
      
      // Force background color based on app theme, not system
      document.body.style.backgroundColor = isDark ? '#0f172a' : '#f9fafb';
      document.body.style.color = isDark ? '#e2e8f0' : '#111827';
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark', newDarkMode);
    document.documentElement.style.colorScheme = newDarkMode ? 'dark' : 'light';
    
    // Force background color based on app theme
    document.body.style.backgroundColor = newDarkMode ? '#0f172a' : '#f9fafb';
    document.body.style.color = newDarkMode ? '#e2e8f0' : '#111827';
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};