import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getCategories,
    createCategory,
    deleteCategory,
    getIncome,
    createIncome,
    updateIncome,
    deleteIncome,
    getIncomeCategories,
    createIncomeCategory,
    deleteIncomeCategory,
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
    const [income, setIncome] = useState([]);
    const [categories, setCategories] = useState([]);
    const [incomeCategories, setIncomeCategories] = useState([]);
    const [dateRange, setDateRange] = useState({ start: null, end: null });
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        // Initialize categories on mount
        initializeCategories();
        loadCategories();
        loadIncomeCategories();
    }, []);

    useEffect(() => {
        // Load expenses and income when user changes
        if (user) {
            loadExpenses();
            loadIncome();
        } else {
            setExpenses([]);
            setIncome([]);
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

    const loadIncome = () => {
        if (user) {
            const userIncome = getIncome(user.id);
            setIncome(userIncome);
        }
    };

    const loadIncomeCategories = () => {
        const cats = getIncomeCategories();
        setIncomeCategories(cats);
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

    // Income Management
    const addIncome = (incomeData) => {
        if (!user) return;

        const newIncome = createIncome({
            ...incomeData,
            userId: user.id
        });

        setIncome(prev => [newIncome, ...prev]);
        return newIncome;
    };

    const editIncome = (incomeId, updates) => {
        const updated = updateIncome(incomeId, updates);
        setIncome(prev => prev.map(i => i.id === incomeId ? updated : i));
        return updated;
    };

    const removeIncome = (incomeId) => {
        deleteIncome(incomeId);
        setIncome(prev => prev.filter(i => i.id !== incomeId));
    };

    const addIncomeCategory = (categoryData) => {
        const newCategory = createIncomeCategory(categoryData);
        setIncomeCategories(prev => [...prev, newCategory]);
        return newCategory;
    };

    const removeIncomeCategory = (categoryId) => {
        deleteIncomeCategory(categoryId);
        setIncomeCategories(prev => prev.filter(c => c.id !== categoryId));
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

    // Filter income based on date range
    const getFilteredIncome = () => {
        let filtered = [...income];

        // Filter by date range
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(inc => {
                const incomeDate = new Date(inc.date);
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                return incomeDate >= start && incomeDate <= end;
            });
        }

        return filtered;
    };

    // Calculate total income
    const getTotalIncome = (incomeList = null) => {
        const list = incomeList || getFilteredIncome();
        return list.reduce((total, inc) => total + parseFloat(inc.amount), 0);
    };

    // Calculate net savings (income - expenses)
    const getNetSavings = () => {
        const totalIncome = getTotalIncome();
        const totalExpenses = getTotalExpenses();
        return totalIncome - totalExpenses;
    };

    // Get income by category
    const getIncomeByCategory = () => {
        const filtered = getFilteredIncome();
        const byCategory = {};

        filtered.forEach(inc => {
            if (!byCategory[inc.categoryId]) {
                byCategory[inc.categoryId] = {
                    total: 0,
                    count: 0,
                    income: []
                };
            }
            byCategory[inc.categoryId].total += parseFloat(inc.amount);
            byCategory[inc.categoryId].count += 1;
            byCategory[inc.categoryId].income.push(inc);
        });

        return byCategory;
    };

    const value = {
        expenses,
        income,
        categories,
        incomeCategories,
        dateRange,
        selectedCategory,
        setDateRange,
        setSelectedCategory,
        addExpense,
        editExpense,
        removeExpense,
        addCategory,
        removeCategory,
        addIncome,
        editIncome,
        removeIncome,
        addIncomeCategory,
        removeIncomeCategory,
        getFilteredExpenses,
        getFilteredIncome,
        getTotalExpenses,
        getTotalIncome,
        getNetSavings,
        getExpensesByCategory,
        getIncomeByCategory
    };

    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );
};
