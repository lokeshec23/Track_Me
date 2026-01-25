import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, register, logout, getAuthUser } from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const currentUser = getAuthUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const handleLogin = async (email, password) => {
        const result = await login(email, password);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const handleRegister = async (userData) => {
        const result = await register(userData);
        if (result.success) {
            setUser(result.user);
        }
        return result;
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    const value = {
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
