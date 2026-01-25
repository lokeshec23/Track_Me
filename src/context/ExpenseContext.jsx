import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getCategories,
    createCategory,
    deleteCategory,
    initializeCategories
} from '../services/storage';
import { useAuth } from './AuthContext';

const ExpenseContext = createContext();

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within ExpenseProvider');
    }
    return context;
};

export const ExpenseProvider = ({ children }) => {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        // Initialize categories on mount
        initializeCategories();
        loadCategories();
    }, []);

    useEffect(() => {
        // Load expenses when user changes
        if (user) {
            loadExpenses();
        } else {
            setExpenses([]);
        }
    }, [user]);

    const loadExpenses = () => {
        if (user) {
            const userExpenses = getExpenses(user.id);
            setExpenses(userExpenses);
        }
    };

    const loadCategories = () => {
        const cats = getCategories();
        setCategories(cats);
    };

    const addExpense = (expenseData) => {
        if (!user) return;

        const newExpense = createExpense({
            ...expenseData,
            userId: user.id
        });

        setExpenses(prev => [newExpense, ...prev]);
        return newExpense;
    };

    const editExpense = (expenseId, updates) => {
        const updated = updateExpense(expenseId, updates);
        setExpenses(prev => prev.map(e => e.id === expenseId ? updated : e));
        return updated;
    };

    const removeExpense = (expenseId) => {
        deleteExpense(expenseId);
        setExpenses(prev => prev.filter(e => e.id !== expenseId));
    };

    const addCategory = (categoryData) => {
        const newCategory = createCategory(categoryData);
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
    };

    const removeCategory = (categoryId) => {
        deleteCategory(categoryId);
        setCategories(prev => prev.filter(c => c.id !== categoryId));
    };

    // Filter expenses based on date range and category
    const getFilteredExpenses = () => {
        let filtered = [...expenses];

        // Filter by date range
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.date);
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                return expenseDate >= start && expenseDate <= end;
            });
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(expense => expense.categoryId === selectedCategory);
        }

        return filtered;
    };

    // Calculate total expenses
    const getTotalExpenses = (expenseList = null) => {
        const list = expenseList || getFilteredExpenses();
        return list.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    };

    // Get expenses by category
    const getExpensesByCategory = () => {
        const filtered = getFilteredExpenses();
        const byCategory = {};

        filtered.forEach(expense => {
            if (!byCategory[expense.categoryId]) {
                byCategory[expense.categoryId] = {
                    total: 0,
                    count: 0,
                    expenses: []
                };
            }
            byCategory[expense.categoryId].total += parseFloat(expense.amount);
            byCategory[expense.categoryId].count += 1;
            byCategory[expense.categoryId].expenses.push(expense);
        });

        return byCategory;
    };

    const value = {
        expenses,
        categories,
        dateRange,
        selectedCategory,
        setDateRange,
        setSelectedCategory,
        addExpense,
        editExpense,
        removeExpense,
        addCategory,
        removeCategory,
        getFilteredExpenses,
        getTotalExpenses,
        getExpensesByCategory
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};
