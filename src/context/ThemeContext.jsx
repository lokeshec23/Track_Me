import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTheme, setTheme as saveThemeToStorage } from '../services/storage';
import { useAuth } from './AuthContext';
import api from '../services/api';


const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [theme, setThemeState] = useState(() => getTheme());

    // Sync theme from user profile when user loads
    useEffect(() => {
        if (user && user.theme) {
            setThemeState(user.theme);
        }
    }, [user]);


    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute('data-theme', theme);
        saveThemeToStorage(theme);

        // Sync to backend if user is logged in
        if (user) {
            // We use a fire-and-forget approach or simple async call
            api.put('/auth/theme', { theme }).catch(err => console.error("Failed to sync theme", err));
        }
    }, [theme, user]);


    const toggleTheme = () => {
        setThemeState(prev => prev === 'light' ? 'dark' : 'light');
    };

    const value = {
        theme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
