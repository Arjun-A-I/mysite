'use client';

import { useEffect, useState } from 'react';
import './DarkModeToggle.css';

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user has a saved preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDarkMode);
    document.documentElement.classList.toggle('light', !newDarkMode);
  };

  if (darkMode === null) {
    return null; // Don't render until we know the theme to avoid flash
  }

  return (
    <div className="fixed top-4 right-4 checkbox-wrapper-35">
      <input 
        checked={darkMode}
        onChange={toggleDarkMode}
        name="switch" 
        id="switch" 
        type="checkbox" 
        className="switch"
      />
      <label htmlFor="switch">
        <span className="switch-x-toggletext">
          <span className="switch-x-unchecked">
            <span className="switch-x-hiddenlabel">Unchecked: </span>
            ☀
          </span>
          <span className="switch-x-checked">
            <span className="switch-x-hiddenlabel">Checked: </span>
            ☾
          </span>
        </span>
      </label>
    </div>
  );
} 