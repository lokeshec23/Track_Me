import api from './api';

// Get all recurring transactions
export const getRecurringTransactions = async (userId) => {
    try {
        const response = await api.get('/recurring/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Create new recurring transaction
export const createRecurring = async (recurringData) => {
    try {
        const response = await api.post('/recurring/', recurringData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Update recurring transaction
export const updateRecurring = async (recurringId, updates) => {
    try {
        const response = await api.put(`/recurring/${recurringId}`, updates);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Delete recurring transaction
export const deleteRecurring = async (recurringId) => {
    try {
        await api.delete(`/recurring/${recurringId}`);
        return true;
    } catch (error) {
        throw error;
    }
};

// Toggle status - handled via updateRecurring
export const toggleRecurringStatus = async (recurring, isActive) => {
    // Changed signature to take recurring object and new status, or just use updateRecurring directly in context
    return await updateRecurring(recurring.id, { isActive });
    return await updateRecurring(recurring.id, { isActive });
};

// Mark recurring as generated
export const markAsGenerated = async (recurringId) => {
    return await updateRecurring(recurringId, {
        lastGenerated: new Date().toISOString()
    });
};



// Helper Pure Functions
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

export const shouldGenerate = (recurring) => {
    if (!recurring.isActive) return false;

    const now = new Date();
    const startDate = new Date(recurring.startDate);

    if (now < startDate) return false;

    if (recurring.endDate) {
        const endDate = new Date(recurring.endDate);
        if (now > endDate) return false;
    }

    if (!recurring.lastGenerated) {
        return now >= startDate;
    }

    const nextOccurrence = getNextOccurrence(recurring);
    return nextOccurrence && now >= nextOccurrence;
};

export const getRecurringToGenerate = (recurringList) => {
    // Changed signature to take list
    return recurringList.filter(rec => shouldGenerate(rec));
};

export const getUpcomingRecurring = (recurringList, days = 30) => {
    // Changed signature to take list
    const active = recurringList.filter(r => r.isActive);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return active.map(rec => {
        const nextOccurrence = getNextOccurrence(rec);
        if (!nextOccurrence || nextOccurrence > futureDate) return null;

        return {
            ...rec,
            nextOccurrence: nextOccurrence.toISOString()
        };
    }).filter(Boolean);
};

export const getRecurringStats = (recurringList) => {
    // Changed signature to take list
    const active = recurringList.filter(r => r.isActive);
    const paused = recurringList.filter(r => !r.isActive);
    const expenses = recurringList.filter(r => r.type === 'expense');
    const income = recurringList.filter(r => r.type === 'income');

    // Calculate monthly impact
    const monthlyExpenses = expenses
        .filter(r => r.isActive)
        .reduce((total, rec) => {
            let monthlyAmount = parseFloat(rec.amount);
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

    const monthlyIncome = income
        .filter(r => r.isActive)
        .reduce((total, rec) => {
            let monthlyAmount = parseFloat(rec.amount);
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
        total: recurringList.length,
        active: active.length,
        paused: paused.length,
        expenses: expenses.length,
        income: income.length,
        monthlyExpenses,
        monthlyIncome,
        monthlyNet: monthlyIncome - monthlyExpenses
    };
};
