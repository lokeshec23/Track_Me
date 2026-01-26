import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getRecurringTransactions,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    toggleRecurringStatus,
    getRecurringToGenerate,
    markAsGenerated,
    getUpcomingRecurring,
    getRecurringStats,
    getNextOccurrence
} from '../services/recurringService';
import { useAuth } from './AuthContext';
import { useExpense } from './ExpenseContext';

const RecurringContext = createContext();

export const useRecurring = () => {
    const context = useContext(RecurringContext);
    if (!context) {
        throw new Error('useRecurring must be used within RecurringProvider');
    }
    return context;
};

export const RecurringProvider = ({ children }) => {
    const { user } = useAuth();
    const { addExpense, addIncome } = useExpense();
    const [recurring, setRecurring] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        paused: 0,
        expenses: 0,
        income: 0,
        monthlyExpenses: 0,
        monthlyIncome: 0,
        monthlyNet: 0
    });

    useEffect(() => {
        if (user) {
            loadRecurring();
        } else {
            setRecurring([]);
            setStats({
                total: 0,
                active: 0,
                paused: 0,
                expenses: 0,
                income: 0,
                monthlyExpenses: 0,
                monthlyIncome: 0,
                monthlyNet: 0
            });
        }
    }, [user]);


    useEffect(() => {
        // Auto-generate recurring transactions
        if (user && recurring.length > 0) {
            generateDueTransactions();
        }
    }, [user, recurring]);

    useEffect(() => {
        // Update stats when recurring changes
        if (user) {
            const newStats = getRecurringStats(recurring);
            setStats(newStats);
        }
    }, [user, recurring]);


    const loadRecurring = async () => {
        if (user) {
            try {
                const userRecurring = await getRecurringTransactions(user.id);
                setRecurring(userRecurring);
            } catch (error) {
                console.error("Failed to load recurring transactions", error);
            }
        }
    };


    const addRecurring = async (recurringData) => {
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
            const newRecurring = await createRecurring({
                ...recurringData,
                userId: user.id
            });

            setRecurring(prev => [...prev, newRecurring]);
            return { success: true, recurring: newRecurring };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const editRecurring = async (recurringId, updates) => {
        try {
            const updated = await updateRecurring(recurringId, updates);
            setRecurring(prev => prev.map(r => r.id === recurringId ? updated : r));
            return { success: true, recurring: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const removeRecurring = async (recurringId) => {
        try {
            await deleteRecurring(recurringId);
            setRecurring(prev => prev.filter(r => r.id !== recurringId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const toggleStatus = async (recurringId) => {
        try {
            const rec = recurring.find(r => r.id === recurringId);
            if (!rec) return { success: false, error: 'Not found' };

            const updated = await toggleRecurringStatus(rec, !rec.isActive);
            setRecurring(prev => prev.map(r => r.id === recurringId ? updated : r));
            return { success: true, recurring: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const generateDueTransactions = async () => {
        if (!user) return;

        const toGenerate = getRecurringToGenerate(recurring);

        // Process sequentially to be safe
        for (const rec of toGenerate) {
            // Create the transaction
            const transactionData = {
                amount: rec.amount,
                categoryId: rec.categoryId,
                date: new Date().toISOString().split('T')[0],
                description: `${rec.description} (Recurring)`
            };

            if (rec.type === 'expense') {
                await addExpense(transactionData);
            } else {
                await addIncome(transactionData);
            }

            // Mark as generated
            await markAsGenerated(rec.id);
        }

        // Reload recurring to update lastGenerated dates
        if (toGenerate.length > 0) {
            await loadRecurring();
        }
    };


    const getUpcoming = (days = 30) => {
        if (!user || recurring.length === 0) return [];
        return getUpcomingRecurring(recurring, days);
    };


    const getRecurringWithNextDate = () => {
        return recurring.map(rec => ({
            ...rec,
            nextOccurrence: getNextOccurrence(rec)
        }));
    };

    const value = {
        recurring,
        stats,
        addRecurring,
        editRecurring,
        removeRecurring,
        toggleStatus,
        generateDueTransactions,
        getUpcoming,
        getRecurringWithNextDate
    };

    return (
        <RecurringContext.Provider value={value}>
            {children}
        </RecurringContext.Provider>
    );
};
