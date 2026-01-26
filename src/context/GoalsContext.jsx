import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    addContribution,
    calculateProgress,
    getDaysUntilDeadline,
    getRequiredMonthlySavings,
    getGoalStats,
    getUpcomingDeadlines
} from '../services/goalsService';
import { useAuth } from './AuthContext';

const GoalsContext = createContext();

export const useGoals = () => {
    const context = useContext(GoalsContext);
    if (!context) {
        throw new Error('useGoals must be used within GoalsProvider');
    }
    return context;
};

export const GoalsProvider = ({ children }) => {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        completed: 0,
        totalTarget: 0,
        totalSaved: 0,
        totalRemaining: 0,
        overallProgress: 0
    });

    useEffect(() => {
        if (user) {
            loadGoals();
        } else {
            setGoals([]);
            resetStats();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const newStats = getGoalStats(user.id);
            setStats(newStats);
        }
    }, [user, goals]);

    const resetStats = () => {
        setStats({
            total: 0,
            active: 0,
            completed: 0,
            totalTarget: 0,
            totalSaved: 0,
            totalRemaining: 0,
            overallProgress: 0
        });
    };

    const loadGoals = () => {
        if (user) {
            const userGoals = getGoals(user.id);
            setGoals(userGoals);
        }
    };

    const addGoal = (goalData) => {
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
            const newGoal = createGoal({
                ...goalData,
                userId: user.id
            });

            setGoals(prev => [...prev, newGoal]);
            return { success: true, goal: newGoal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const editGoal = (goalId, updates) => {
        try {
            const updated = updateGoal(goalId, updates);
            setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
            return { success: true, goal: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const removeGoal = (goalId) => {
        try {
            deleteGoal(goalId);
            setGoals(prev => prev.filter(g => g.id !== goalId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const contribute = (goalId, amount) => {
        try {
            const updated = addContribution(goalId, parseFloat(amount));
            setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
            return { success: true, goal: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const getGoalProgress = (goalId) => {
        const goal = goals.find(g => g.id === goalId);
        if (!goal) return null;
        return calculateProgress(goal);
    };

    const getGoalsWithProgress = () => {
        return goals.map(goal => ({
            ...goal,
            progress: calculateProgress(goal),
            daysUntilDeadline: getDaysUntilDeadline(goal),
            requiredMonthlySavings: getRequiredMonthlySavings(goal)
        }));
    };

    const getUpcoming = (days = 30) => {
        if (!user) return [];
        return getUpcomingDeadlines(user.id, days);
    };

    const value = {
        goals,
        stats,
        addGoal,
        editGoal,
        removeGoal,
        contribute,
        getGoalProgress,
        getGoalsWithProgress,
        getUpcoming
    };

    return (
        <GoalsContext.Provider value={value}>
            {children}
        </GoalsContext.Provider>
    );
};
