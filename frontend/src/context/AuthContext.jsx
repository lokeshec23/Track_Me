import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

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
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Validate token and get user details
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await api.get('/auth/me');
                    setUser({ token, ...response.data });
                } catch (error) {
                    console.error("Session check failed", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);


    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { access_token, is_onboarded } = response.data;
            localStorage.setItem('token', access_token);
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            const userObj = { email, token: access_token, is_onboarded };
            setUser(userObj);


            await migrateData();
            return { success: true, user: userObj };
        } catch (error) {
            console.error("Login failed", error);
            return { success: false, error: error.response?.data?.detail || error.message || "Login failed" };
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/auth/register', {
                username: userData.name || userData.username,
                email: userData.email,
                password: userData.password
            });
            // Do not auto login, let them login manually to check flow
            return { success: true };

        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, error: error.response?.data?.detail || error.message || "Registration failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const completeOnboarding = async (data) => {
        try {
            const response = await api.put('/auth/onboarding', data);
            setUser(prev => ({ ...prev, is_onboarded: true, onboarding_data: data }));
            return { success: true, user: response.data.user };
        } catch (error) {
            console.error("Onboarding failed", error);
            return { success: false, error: error.response?.data?.detail || "Onboarding failed" };
        }
    };


    const migrateData = async () => {
        const expenses = JSON.parse(localStorage.getItem('trackme_expenses') || '[]');
        const income = JSON.parse(localStorage.getItem('trackme_income') || '[]');

        if (expenses.length === 0 && income.length === 0) return;

        const allTransactions = [
            ...expenses.map(e => ({
                amount: parseFloat(e.amount),
                description: e.description || '',
                categoryId: e.categoryId,
                date: e.date,
                type: 'expense',
                paymentMode: e.paymentMode || 'UPI'
            })),
            ...income.map(i => ({
                amount: parseFloat(i.amount),
                description: i.description || '',
                categoryId: i.categoryId,
                date: i.date,
                type: 'income',
                paymentMode: i.paymentMode || 'UPI'
            }))
        ];

        if (allTransactions.length > 0) {
            try {
                console.log("Migrating", allTransactions.length, "transactions");
                await api.post('/transactions/sync', allTransactions);

                // Clear local storage
                localStorage.removeItem('trackme_expenses');
                localStorage.removeItem('trackme_income');
                localStorage.removeItem('trackme_users');
                localStorage.removeItem('trackme_current_user');
                console.log('Migration successful');
            } catch (error) {
                console.error('Migration failed', error);
            }
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        completeOnboarding,
        isAuthenticated: !!user,
        needsOnboarding: user && !user.is_onboarded
    };


    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
