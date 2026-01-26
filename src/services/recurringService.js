// Recurring Transaction Service - LocalStorage operations for recurring transactions

const STORAGE_KEYS = {
    RECURRING: 'trackme_recurring'
};

/**
 * Recurring Transaction structure:
 * {
 *   id: string,
 *   userId: string,
 *   type: 'expense' | 'income',
 *   amount: number,
 *   categoryId: string,
 *   description: string,
 *   frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
 *   startDate: string (ISO),
 *   endDate: string (ISO) | null,
 *   lastGenerated: string (ISO) | null,
 *   isActive: boolean,
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

// Get all recurring transactions
export const getRecurringTransactions = (userId) => {
    const allRecurring = getItem(STORAGE_KEYS.RECURRING) || [];
    return userId ? allRecurring.filter(rec => rec.userId === userId) : allRecurring;
};

// Get recurring transaction by ID
export const getRecurringById = (recurringId) => {
    const allRecurring = getItem(STORAGE_KEYS.RECURRING) || [];
    return allRecurring.find(rec => rec.id === recurringId);
};

// Create new recurring transaction
export const createRecurring = (recurringData) => {
    const allRecurring = getItem(STORAGE_KEYS.RECURRING) || [];

    const newRecurring = {
        id: Date.now().toString(),
        userId: recurringData.userId,
        type: recurringData.type,
        amount: parseFloat(recurringData.amount),
        categoryId: recurringData.categoryId,
        description: recurringData.description || '',
        frequency: recurringData.frequency,
        startDate: recurringData.startDate || new Date().toISOString(),
        endDate: recurringData.endDate || null,
        lastGenerated: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    allRecurring.push(newRecurring);
    setItem(STORAGE_KEYS.RECURRING, allRecurring);

    return newRecurring;
};

// Update recurring transaction
export const updateRecurring = (recurringId, updates) => {
    const allRecurring = getItem(STORAGE_KEYS.RECURRING) || [];
    const index = allRecurring.findIndex(r => r.id === recurringId);

    if (index === -1) {
        throw new Error('Recurring transaction not found');
    }

    allRecurring[index] = {
        ...allRecurring[index],
        ...updates,
        amount: updates.amount ? parseFloat(updates.amount) : allRecurring[index].amount,
        updatedAt: new Date().toISOString()
    };

    setItem(STORAGE_KEYS.RECURRING, allRecurring);
    return allRecurring[index];
};

// Delete recurring transaction
export const deleteRecurring = (recurringId) => {
    const allRecurring = getItem(STORAGE_KEYS.RECURRING) || [];
    const filteredRecurring = allRecurring.filter(r => r.id !== recurringId);

    setItem(STORAGE_KEYS.RECURRING, filteredRecurring);
    return true;
};

// Toggle recurring transaction active status
export const toggleRecurringStatus = (recurringId) => {
    const recurring = getRecurringById(recurringId);
    if (!recurring) {
        throw new Error('Recurring transaction not found');
    }

    return updateRecurring(recurringId, { isActive: !recurring.isActive });
};

// Calculate next occurrence date
export const getNextOccurrence = (recurring) => {
    const lastDate = recurring.lastGenerated
        ? new Date(recurring.lastGenerated)
        : new Date(recurring.startDate);

    const nextDate = new Date(lastDate);

    switch (recurring.frequency) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
        default:
            return null;
    }

    return nextDate;
};

// Check if recurring transaction should generate
export const shouldGenerate = (recurring) => {
    if (!recurring.isActive) return false;

    const now = new Date();
    const startDate = new Date(recurring.startDate);

    // Not started yet
    if (now < startDate) return false;

    // Check if ended
    if (recurring.endDate) {
        const endDate = new Date(recurring.endDate);
        if (now > endDate) return false;
    }

    // First time generation
    if (!recurring.lastGenerated) {
        return now >= startDate;
    }

    // Check if next occurrence has passed
    const nextOccurrence = getNextOccurrence(recurring);
    return nextOccurrence && now >= nextOccurrence;
};

// Get all recurring transactions that need to be generated
export const getRecurringToGenerate = (userId) => {
    const recurring = getRecurringTransactions(userId);
    return recurring.filter(rec => shouldGenerate(rec));
};

// Mark recurring as generated
export const markAsGenerated = (recurringId) => {
    return updateRecurring(recurringId, {
        lastGenerated: new Date().toISOString()
    });
};

// Get upcoming recurring transactions (next 30 days)
export const getUpcomingRecurring = (userId, days = 30) => {
    const recurring = getRecurringTransactions(userId).filter(r => r.isActive);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return recurring.map(rec => {
        const nextOccurrence = getNextOccurrence(rec);
        if (!nextOccurrence || nextOccurrence > futureDate) return null;

        return {
            ...rec,
            nextOccurrence: nextOccurrence.toISOString()
        };
    }).filter(Boolean);
};

// Get recurring transaction statistics
export const getRecurringStats = (userId) => {
    const recurring = getRecurringTransactions(userId);

    const active = recurring.filter(r => r.isActive);
    const paused = recurring.filter(r => !r.isActive);
    const expenses = recurring.filter(r => r.type === 'expense');
    const income = recurring.filter(r => r.type === 'income');

    // Calculate monthly impact
    const monthlyExpenses = expenses
        .filter(r => r.isActive)
        .reduce((total, rec) => {
            let monthlyAmount = rec.amount;
            switch (rec.frequency) {
                case 'daily':
                    monthlyAmount *= 30;
                    break;
                case 'weekly':
                    monthlyAmount *= 4;
                    break;
                case 'yearly':
                    monthlyAmount /= 12;
                    break;
                // monthly stays the same
            }
            return total + monthlyAmount;
        }, 0);

    const monthlyIncome = income
        .filter(r => r.isActive)
        .reduce((total, rec) => {
            let monthlyAmount = rec.amount;
            switch (rec.frequency) {
                case 'daily':
                    monthlyAmount *= 30;
                    break;
                case 'weekly':
                    monthlyAmount *= 4;
                    break;
                case 'yearly':
                    monthlyAmount /= 12;
                    break;
            }
            return total + monthlyAmount;
        }, 0);

    return {
        total: recurring.length,
        active: active.length,
        paused: paused.length,
        expenses: expenses.length,
        income: income.length,
        monthlyExpenses,
        monthlyIncome,
        monthlyNet: monthlyIncome - monthlyExpenses
    };
};

export default {
    getRecurringTransactions,
    getRecurringById,
    createRecurring,
    updateRecurring,
    deleteRecurring,
    toggleRecurringStatus,
    getNextOccurrence,
    shouldGenerate,
    getRecurringToGenerate,
    markAsGenerated,
    getUpcomingRecurring,
    getRecurringStats
};
