// Goals Service - LocalStorage operations for financial goals

const STORAGE_KEYS = {
    GOALS: 'trackme_goals'
};

/**
 * Goal structure:
 * {
 *   id: string,
 *   userId: string,
 *   name: string,
 *   targetAmount: number,
 *   currentAmount: number,
 *   deadline: string (ISO) | null,
 *   category: string (e.g., 'emergency', 'vacation', 'purchase', 'investment', 'other'),
 *   icon: string,
 *   color: string,
 *   isCompleted: boolean,
 *   createdAt: string (ISO),
 *   updatedAt: string (ISO),
 *   completedAt: string (ISO) | null
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

// Get all goals
export const getGoals = (userId) => {
    const allGoals = getItem(STORAGE_KEYS.GOALS) || [];
    return userId ? allGoals.filter(goal => goal.userId === userId) : allGoals;
};

// Get goal by ID
export const getGoalById = (goalId) => {
    const allGoals = getItem(STORAGE_KEYS.GOALS) || [];
    return allGoals.find(goal => goal.id === goalId);
};

// Create new goal
export const createGoal = (goalData) => {
    const allGoals = getItem(STORAGE_KEYS.GOALS) || [];

    const newGoal = {
        id: Date.now().toString(),
        userId: goalData.userId,
        name: goalData.name,
        targetAmount: parseFloat(goalData.targetAmount),
        currentAmount: goalData.currentAmount ? parseFloat(goalData.currentAmount) : 0,
        deadline: goalData.deadline || null,
        category: goalData.category || 'other',
        icon: goalData.icon || '🎯',
        color: goalData.color || '#6366f1',
        isCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        completedAt: null
    };

    allGoals.push(newGoal);
    setItem(STORAGE_KEYS.GOALS, allGoals);

    return newGoal;
};

// Update goal
export const updateGoal = (goalId, updates) => {
    const allGoals = getItem(STORAGE_KEYS.GOALS) || [];
    const index = allGoals.findIndex(g => g.id === goalId);

    if (index === -1) {
        throw new Error('Goal not found');
    }

    const wasCompleted = allGoals[index].isCompleted;
    const updatedGoal = {
        ...allGoals[index],
        ...updates,
        targetAmount: updates.targetAmount ? parseFloat(updates.targetAmount) : allGoals[index].targetAmount,
        currentAmount: updates.currentAmount !== undefined ? parseFloat(updates.currentAmount) : allGoals[index].currentAmount,
        updatedAt: new Date().toISOString()
    };

    // Check if goal is now completed
    if (!wasCompleted && updatedGoal.currentAmount >= updatedGoal.targetAmount) {
        updatedGoal.isCompleted = true;
        updatedGoal.completedAt = new Date().toISOString();
    }

    // Check if goal is uncompleted
    if (wasCompleted && updatedGoal.currentAmount < updatedGoal.targetAmount) {
        updatedGoal.isCompleted = false;
        updatedGoal.completedAt = null;
    }

    allGoals[index] = updatedGoal;
    setItem(STORAGE_KEYS.GOALS, allGoals);

    return updatedGoal;
};

// Delete goal
export const deleteGoal = (goalId) => {
    const allGoals = getItem(STORAGE_KEYS.GOALS) || [];
    const filteredGoals = allGoals.filter(g => g.id !== goalId);

    setItem(STORAGE_KEYS.GOALS, filteredGoals);
    return true;
};

// Add contribution to goal
export const addContribution = (goalId, amount) => {
    const goal = getGoalById(goalId);
    if (!goal) {
        throw new Error('Goal not found');
    }

    const newAmount = goal.currentAmount + parseFloat(amount);
    return updateGoal(goalId, { currentAmount: newAmount });
};

// Calculate goal progress
export const calculateProgress = (goal) => {
    if (!goal || goal.targetAmount === 0) {
        return {
            percentage: 0,
            remaining: 0,
            isCompleted: false
        };
    }

    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

    return {
        percentage,
        remaining,
        isCompleted: goal.isCompleted || goal.currentAmount >= goal.targetAmount
    };
};

// Calculate days until deadline
export const getDaysUntilDeadline = (goal) => {
    if (!goal.deadline) return null;

    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

// Calculate required monthly savings
export const getRequiredMonthlySavings = (goal) => {
    if (!goal.deadline) return null;

    const daysUntilDeadline = getDaysUntilDeadline(goal);
    if (daysUntilDeadline === null || daysUntilDeadline <= 0) return null;

    const remaining = goal.targetAmount - goal.currentAmount;
    const monthsUntilDeadline = daysUntilDeadline / 30;

    return remaining / monthsUntilDeadline;
};

// Get goal statistics
export const getGoalStats = (userId) => {
    const goals = getGoals(userId);

    const active = goals.filter(g => !g.isCompleted);
    const completed = goals.filter(g => g.isCompleted);

    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemaining = totalTarget - totalSaved;

    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
        total: goals.length,
        active: active.length,
        completed: completed.length,
        totalTarget,
        totalSaved,
        totalRemaining,
        overallProgress
    };
};

// Get goals by category
export const getGoalsByCategory = (userId) => {
    const goals = getGoals(userId);
    const byCategory = {};

    goals.forEach(goal => {
        if (!byCategory[goal.category]) {
            byCategory[goal.category] = {
                goals: [],
                totalTarget: 0,
                totalSaved: 0
            };
        }

        byCategory[goal.category].goals.push(goal);
        byCategory[goal.category].totalTarget += goal.targetAmount;
        byCategory[goal.category].totalSaved += goal.currentAmount;
    });

    return byCategory;
};

// Get upcoming deadlines (next 30 days)
export const getUpcomingDeadlines = (userId, days = 30) => {
    const goals = getGoals(userId).filter(g => !g.isCompleted && g.deadline);

    return goals
        .map(goal => ({
            ...goal,
            daysUntil: getDaysUntilDeadline(goal)
        }))
        .filter(goal => goal.daysUntil !== null && goal.daysUntil >= 0 && goal.daysUntil <= days)
        .sort((a, b) => a.daysUntil - b.daysUntil);
};

export default {
    getGoals,
    getGoalById,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    calculateProgress,
    getDaysUntilDeadline,
    getRequiredMonthlySavings,
    getGoalStats,
    getGoalsByCategory,
    getUpcomingDeadlines
};
