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

  // Ultra-aggressive system dark mode override
  useEffect(() => {
    // Force light mode initialization
    document.documentElement.style.colorScheme = 'light';
    document.documentElement.style.backgroundColor = '#f9fafb';
    document.body.style.colorScheme = 'light';
    document.body.style.backgroundColor = '#f9fafb';
    document.body.style.color = '#111827';
    
    // Remove any system dark mode classes
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
    
    // Override system preference detection
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Force light mode regardless of system preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === null) {
      // Default to light mode, completely ignore system
      setDarkMode(false);
      document.documentElement.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
    }
    
    // Block and override system theme changes
    const handleSystemThemeChange = (e) => {
      console.log('System theme change blocked - forcing app theme');
      // Force light mode if system tries to override
      if (!darkMode) {
        document.documentElement.style.colorScheme = 'light';
        document.body.style.backgroundColor = '#f9fafb';
        document.body.style.color = '#111827';
        document.documentElement.classList.remove('dark');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [darkMode]);

  // Load user preference (not system preference)
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      
      // Apply user preference, ignore system completely
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        document.body.style.backgroundColor = '#0f172a';
        document.body.style.color = '#e2e8f0';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
        document.body.style.backgroundColor = '#f9fafb';
        document.body.style.color = '#111827';
      }
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Apply user choice, ignore system completely
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      document.body.style.backgroundColor = '#0f172a';
      document.body.style.color = '#e2e8f0';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      document.body.style.backgroundColor = '#f9fafb';
      document.body.style.color = '#111827';
    }
  };

  return (
    <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};