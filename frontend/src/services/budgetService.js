import api from './api';

// Get all budgets
export const getBudgets = async (userId) => {
    try {
        const response = await api.get('/budgets/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new budget
export const createBudget = async (budgetData) => {
    try {
        const response = await api.post('/budgets/', budgetData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update budget
export const updateBudget = async (budgetId, updates) => {
    try {
        const response = await api.put(`/budgets/${budgetId}`, updates);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete budget
export const deleteBudget = async (budgetId) => {
    try {
        await api.delete(`/budgets/${budgetId}`);
        return true;
    } catch (error) {
        throw error;
    }
};

// Helper functions (Pure)
export const calculateBudgetUtilization = (budget, expenses) => {
    if (!budget || !expenses) {
        return {
            budgetAmount: 0,
            spent: 0,
            remaining: 0,
            percentage: 0,
            isOverBudget: false,
            isNearLimit: false
        };
    }

    // Filter expenses for the budget period
    const periodExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const budgetStart = new Date(budget.startDate);

        if (budget.period === 'monthly') {
            return expenseDate.getMonth() === budgetStart.getMonth() &&
                expenseDate.getFullYear() === budgetStart.getFullYear();
        } else if (budget.period === 'yearly') {
            return expenseDate.getFullYear() === budgetStart.getFullYear();
        }

        return false;
    });

    // Filter by category if not overall budget
    const relevantExpenses = budget.categoryId === 'overall'
        ? periodExpenses
        : periodExpenses.filter(e => e.categoryId === budget.categoryId);

    const spent = relevantExpenses.reduce((total, expense) =>
        total + parseFloat(expense.amount), 0
    );

    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const isOverBudget = spent > budget.amount;
    const isNearLimit = percentage >= budget.alertThreshold && !isOverBudget;

    return {
        budgetAmount: budget.amount,
        spent,
        remaining,
        percentage,
        isOverBudget,
        isNearLimit,
        expenseCount: relevantExpenses.length
    };
};

export const getAllBudgetUtilizations = (budgets, expenses) => {
    // Changed signature to take budgets array
    return budgets.map(budget => ({
        budget,
        utilization: calculateBudgetUtilization(budget, expenses)
    }));
};

export const getBudgetAlerts = (budgets, expenses) => {
    // Changed signature to take budgets array
    const utilizations = getAllBudgetUtilizations(budgets, expenses);

    return utilizations
        .filter(({ utilization }) => utilization.isOverBudget || utilization.isNearLimit)
        .map(({ budget, utilization }) => ({
            budgetId: budget.id,
            categoryId: budget.categoryId,
            type: utilization.isOverBudget ? 'over' : 'near',
            percentage: utilization.percentage,
            spent: utilization.spent,
            budgetAmount: utilization.budgetAmount
        }));
};

// Removed getters that depended on local storage fetch (getBudgetByCategory, etc.)
// These should be handled by finding in the 'budgets' list in Context.
