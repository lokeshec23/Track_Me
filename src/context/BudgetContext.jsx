import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getBudgets,
    getBudgetById,
    getBudgetByCategory,
    getOverallBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    calculateBudgetUtilization,
    getAllBudgetUtilizations,
    getBudgetAlerts
} from '../services/budgetService';
import { useAuth } from './AuthContext';
import { useExpense } from './ExpenseContext';

const BudgetContext = createContext();

export const useBudget = () => {
    const context = useContext(BudgetContext);
    if (!context) {
        throw new Error('useBudget must be used within BudgetProvider');
    }
    return context;
};

export const BudgetProvider = ({ children }) => {
    const { user } = useAuth();
    const { expenses } = useExpense();
    const [budgets, setBudgets] = useState([]);
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        if (user) {
            loadBudgets();
        } else {
            setBudgets([]);
            setAlerts([]);
        }
    }, [user]);

    useEffect(() => {
        // Update alerts when budgets or expenses change
        if (user && budgets.length > 0) {
            const budgetAlerts = getBudgetAlerts(user.id, expenses);
            setAlerts(budgetAlerts);
        }
    }, [user, budgets, expenses]);

    const loadBudgets = () => {
        if (user) {
            const userBudgets = getBudgets(user.id);
            setBudgets(userBudgets);
        }
    };

    const addBudget = (budgetData) => {
        if (!user) return;

        try {
            const newBudget = createBudget({
                ...budgetData,
                userId: user.id
            });

            setBudgets(prev => [...prev, newBudget]);
            return { success: true, budget: newBudget };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const editBudget = (budgetId, updates) => {
        try {
            const updated = updateBudget(budgetId, updates);
            setBudgets(prev => prev.map(b => b.id === budgetId ? updated : b));
            return { success: true, budget: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const removeBudget = (budgetId) => {
        try {
            deleteBudget(budgetId);
            setBudgets(prev => prev.filter(b => b.id !== budgetId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getBudgetForCategory = (categoryId, period = 'monthly') => {
        if (!user) return null;
        return getBudgetByCategory(user.id, categoryId, period);
    };

    const getOverall = (period = 'monthly') => {
        if (!user) return null;
        return getOverallBudget(user.id, period);
    };

    const getBudgetUtilization = (budgetId) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return null;
        return calculateBudgetUtilization(budget, expenses);
    };

    const getAllUtilizations = () => {
        if (!user) return [];
        return getAllBudgetUtilizations(user.id, expenses);
    };

    const getCategoryBudgetStatus = (categoryId) => {
        const budget = getBudgetForCategory(categoryId);
        if (!budget) return null;
        return calculateBudgetUtilization(budget, expenses);
    };

    const getOverallBudgetStatus = () => {
        const budget = getOverall();
        if (!budget) return null;
        return calculateBudgetUtilization(budget, expenses);
    };

    const hasActiveBudgets = () => {
        return budgets.length > 0;
    };

    const value = {
        budgets,
        alerts,
        addBudget,
        editBudget,
        removeBudget,
        getBudgetForCategory,
        getOverall,
        getBudgetUtilization,
        getAllUtilizations,
        getCategoryBudgetStatus,
        getOverallBudgetStatus,
        hasActiveBudgets
    };

    return (
        <BudgetContext.Provider value={value}>
            {children}
        </BudgetContext.Provider>
    );
};
