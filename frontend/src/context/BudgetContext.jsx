import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getBudgets,
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
            const budgetAlerts = getBudgetAlerts(budgets, expenses);
            setAlerts(budgetAlerts);
        }
    }, [user, budgets, expenses]);


    const loadBudgets = async () => {
        if (user) {
            try {
                const userBudgets = await getBudgets(user.id);
                setBudgets(userBudgets);
            } catch (error) {
                console.error("Failed to load budgets", error);
            }
        }
    };


    const addBudget = async (budgetData) => {
        if (!user) return;

        try {
            const newBudget = await createBudget({
                ...budgetData,
                userId: user.id
            });

            setBudgets(prev => [...prev, newBudget]);
            return { success: true, budget: newBudget };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const editBudget = async (budgetId, updates) => {
        try {
            const updated = await updateBudget(budgetId, updates);
            setBudgets(prev => prev.map(b => b.id === budgetId ? updated : b));
            return { success: true, budget: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const removeBudget = async (budgetId) => {
        try {
            await deleteBudget(budgetId);
            setBudgets(prev => prev.filter(b => b.id !== budgetId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const getBudgetForCategory = (categoryId, period = 'monthly') => {
        if (!user) return null;
        // Use local state instead of service
        return budgets.find(b =>
            b.categoryId === categoryId &&
            b.period === period &&
            isCurrentPeriod(b)
        );
    };

    const getOverall = (period = 'monthly') => {
        if (!user) return null;
        return getBudgetForCategory('overall', period);
    };

    const isCurrentPeriod = (budget) => {
        const now = new Date();
        const startDate = new Date(budget.startDate);

        if (budget.period === 'monthly') {
            return startDate.getMonth() === now.getMonth() &&
                startDate.getFullYear() === now.getFullYear();
        } else if (budget.period === 'yearly') {
            return startDate.getFullYear() === now.getFullYear();
        }
        return false;
    };


    const getBudgetUtilization = (budgetId) => {
        const budget = budgets.find(b => b.id === budgetId);
        if (!budget) return null;
        return calculateBudgetUtilization(budget, expenses);
    };

    const getAllUtilizations = () => {
        if (!user) return [];
        return getAllBudgetUtilizations(budgets, expenses);
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
