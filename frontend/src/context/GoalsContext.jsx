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
        if (user && goals.length > 0) {
            const newStats = getGoalStats(goals);
            setStats(newStats);
        } else if (goals.length === 0) {
            resetStats();
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

    const loadGoals = async () => {
        if (user) {
            try {
                const userGoals = await getGoals(user.id);
                setGoals(userGoals);
            } catch (error) {
                console.error("Failed to load goals", error);
            }
        }
    };


    const addGoal = async (goalData) => {
        if (!user) return { success: false, error: 'User not authenticated' };

        try {
            const newGoal = await createGoal({
                ...goalData,
                userId: user.id
            });

            setGoals(prev => [...prev, newGoal]);
            return { success: true, goal: newGoal };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const editGoal = async (goalId, updates) => {
        try {
            const updated = await updateGoal(goalId, updates);
            setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
            return { success: true, goal: updated };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const removeGoal = async (goalId) => {
        try {
            await deleteGoal(goalId);
            setGoals(prev => prev.filter(g => g.id !== goalId));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const contribute = async (goalId, amount) => {
        try {
            // Fetch current goal first to calculate new amount or handle via backend logic if supported
            // Better: Let backend handle increment, but our generic updateGoal just replaces.
            // So we need: find goal -> calc -> update
            const goal = goals.find(g => g.id === goalId);
            if (!goal) throw new Error("Goal not found");

            const newAmount = (goal.currentAmount || 0) + parseFloat(amount);
            const updated = await updateGoal(goalId, { currentAmount: newAmount });

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
        if (!user || goals.length === 0) return [];
        return getUpcomingDeadlines(goals, days);
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
