// Budget Service - LocalStorage operations for budget management

const STORAGE_KEYS = {
    BUDGETS: 'trackme_budgets'
};

/**
 * Budget structure:
 * {
 *   id: string,
 *   userId: string,
 *   categoryId: string | 'overall', // 'overall' for total monthly budget
 *   amount: number,
 *   period: 'monthly' | 'yearly',
 *   startDate: string (ISO),
 *   alertThreshold: number (percentage, e.g., 80 for 80%)
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO)
 * }
 */

// Get data from localStorage
const getItem = (key) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.error(`Error getting ${key} from localStorage:`, error);
        return null;
    }
};

// Set data to localStorage
const setItem = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error setting ${key} to localStorage:`, error);
        return false;
    }
};

// Get all budgets
export const getBudgets = (userId) => {
    const allBudgets = getItem(STORAGE_KEYS.BUDGETS) || [];
    return userId ? allBudgets.filter(budget => budget.userId === userId) : allBudgets;
};

// Get budget by ID
export const getBudgetById = (budgetId) => {
    const allBudgets = getItem(STORAGE_KEYS.BUDGETS) || [];
    return allBudgets.find(budget => budget.id === budgetId);
};

// Get budget by category
export const getBudgetByCategory = (userId, categoryId, period = 'monthly') => {
    const budgets = getBudgets(userId);
    return budgets.find(budget =>
        budget.categoryId === categoryId &&
        budget.period === period &&
        isCurrentPeriod(budget)
    );
};

// Get overall budget
export const getOverallBudget = (userId, period = 'monthly') => {
    return getBudgetByCategory(userId, 'overall', period);
};

// Create new budget
export const createBudget = (budgetData) => {
    const allBudgets = getItem(STORAGE_KEYS.BUDGETS) || [];

    // Check if budget already exists for this category and period
    const existingBudget = allBudgets.find(b =>
        b.userId === budgetData.userId &&
        b.categoryId === budgetData.categoryId &&
        b.period === budgetData.period &&
        isCurrentPeriod(b)
    );

    if (existingBudget) {
        throw new Error('Budget already exists for this category and period');
    }

    const newBudget = {
        id: Date.now().toString(),
        userId: budgetData.userId,
        categoryId: budgetData.categoryId,
        amount: parseFloat(budgetData.amount),
        period: budgetData.period || 'monthly',
        startDate: budgetData.startDate || new Date().toISOString(),
        alertThreshold: budgetData.alertThreshold || 80,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    allBudgets.push(newBudget);
    setItem(STORAGE_KEYS.BUDGETS, allBudgets);

    return newBudget;
};

// Update budget
export const updateBudget = (budgetId, updates) => {
    const allBudgets = getItem(STORAGE_KEYS.BUDGETS) || [];
    const index = allBudgets.findIndex(b => b.id === budgetId);

    if (index === -1) {
        throw new Error('Budget not found');
    }

    allBudgets[index] = {
        ...allBudgets[index],
        ...updates,
        amount: updates.amount ? parseFloat(updates.amount) : allBudgets[index].amount,
        updatedAt: new Date().toISOString()
    };

    setItem(STORAGE_KEYS.BUDGETS, allBudgets);
    return allBudgets[index];
};

// Delete budget
export const deleteBudget = (budgetId) => {
    const allBudgets = getItem(STORAGE_KEYS.BUDGETS) || [];
    const filteredBudgets = allBudgets.filter(b => b.id !== budgetId);

    setItem(STORAGE_KEYS.BUDGETS, filteredBudgets);
    return true;
};

// Check if budget is for current period
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

// Calculate budget utilization
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

// Get all budget utilizations for a user
export const getAllBudgetUtilizations = (userId, expenses) => {
    const budgets = getBudgets(userId);
    return budgets.map(budget => ({
        budget,
        utilization: calculateBudgetUtilization(budget, expenses)
    }));
};

// Check if any budgets need alerts
export const getBudgetAlerts = (userId, expenses) => {
    const utilizations = getAllBudgetUtilizations(userId, expenses);

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

export default {
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
};
