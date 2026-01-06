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
    // Force remove any system dark mode classes
    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
    
    // Force light mode background immediately
    document.body.style.backgroundColor = '#f9fafb';
    document.body.style.color = '#111827';
    
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      const isDark = savedDarkMode === 'true';
      setDarkMode(isDark);
      
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.body.style.backgroundColor = '#0f172a';
        document.body.style.color = '#e2e8f0';
      } else {
        document.documentElement.classList.remove('dark');
        document.body.style.backgroundColor = '#f9fafb';
        document.body.style.color = '#111827';
      }
      
      // iOS Safari specific: Force complete repaint
      setTimeout(() => {
        document.documentElement.style.webkitTransform = 'translateZ(0)';
        document.documentElement.style.webkitTransform = '';
        document.body.style.webkitTransform = 'translateZ(0)';
        document.body.style.webkitTransform = '';
        
        // Force iOS Safari to recalculate all styles
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          el.style.webkitTransform = 'translateZ(0)';
          el.style.webkitTransform = '';
        });
      }, 100);
    }
  }, []);

  // Handle dark mode toggle
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Force theme change with immediate style updates
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
    
    // Force complete iOS Safari repaint
    setTimeout(() => {
      document.documentElement.style.webkitTransform = 'translateZ(0)';
      document.documentElement.style.webkitTransform = '';
      document.body.style.webkitTransform = 'translateZ(0)';
      document.body.style.webkitTransform = '';
      
      // Force recalculation of all elements
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        el.style.webkitTransform = 'translateZ(0)';
        el.style.webkitTransform = '';
      });
      
      // Additional iOS Safari hack: force style recalculation
      document.body.style.display = 'none';
      document.body.offsetHeight; // Force reflow
      document.body.style.display = '';
    }, 150);
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