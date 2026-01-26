import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import {
    getCategories,
    createCategory,
    deleteCategory,
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
        if (user) {
            fetchTransactions();
        } else {
            setExpenses([]);
            setIncome([]);
        }
    }, [user]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions/');
            const allTxns = res.data;
            setExpenses(allTxns.filter(t => t.type === 'expense'));
            setIncome(allTxns.filter(t => t.type === 'income'));
        } catch (err) {
            console.error("Failed to fetch transactions", err);
        }
    };

    const loadCategories = () => {
        const cats = getCategories();
        setCategories(cats);
    };

    const loadIncomeCategories = () => {
        const cats = getIncomeCategories();
        setIncomeCategories(cats);
    };

    const addExpense = async (expenseData) => {
        if (!user) return;
        try {
            const res = await api.post('/transactions/', { ...expenseData, type: 'expense' });
            const newExpense = res.data;
            setExpenses(prev => [newExpense, ...prev]);
            return newExpense;
        } catch (err) { console.error(err); throw err; }
    };

    const editExpense = async (expenseId, updates) => {
        try {
            const existing = expenses.find(e => e.id === expenseId);
            if (!existing) return;
            const payload = { ...existing, ...updates, type: 'expense' };
            const res = await api.put(`/transactions/${expenseId}`, payload);
            const updated = res.data;
            setExpenses(prev => prev.map(e => e.id === expenseId ? updated : e));
            return updated;
        } catch (err) { console.error(err); throw err; }
    };

    const removeExpense = async (expenseId) => {
        try {
            await api.delete(`/transactions/${expenseId}`);
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
        } catch (err) { console.error(err); throw err; }
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

    const addIncome = async (incomeData) => {
        if (!user) return;
        try {
            const res = await api.post('/transactions/', { ...incomeData, type: 'income' });
            const newIncome = res.data;
            setIncome(prev => [newIncome, ...prev]);
            return newIncome;
        } catch (err) { console.error(err); throw err; }
    };

    const editIncome = async (incomeId, updates) => {
        try {
            const existing = income.find(i => i.id === incomeId);
            if (!existing) return;
            const payload = { ...existing, ...updates, type: 'income' };
            const res = await api.put(`/transactions/${incomeId}`, payload);
            const updated = res.data;
            setIncome(prev => prev.map(i => i.id === incomeId ? updated : i));
            return updated;
        } catch (err) { console.error(err); throw err; }
    };

    const removeIncome = async (incomeId) => {
        try {
            await api.delete(`/transactions/${incomeId}`);
            setIncome(prev => prev.filter(i => i.id !== incomeId));
        } catch (err) { console.error(err); throw err; }
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

    const getFilteredExpenses = () => {
        let filtered = [...expenses];
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(expense => {
                const expenseDate = new Date(expense.date);
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                return expenseDate >= start && expenseDate <= end;
            });
        }
        if (selectedCategory) {
            filtered = filtered.filter(expense => expense.categoryId === selectedCategory);
        }
        return filtered;
    };

    const getTotalExpenses = (expenseList = null) => {
        const list = expenseList || getFilteredExpenses();
        return list.reduce((total, expense) => total + parseFloat(expense.amount), 0);
    };

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

    const getFilteredIncome = () => {
        let filtered = [...income];
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

    const getTotalIncome = (incomeList = null) => {
        const list = incomeList || getFilteredIncome();
        return list.reduce((total, inc) => total + parseFloat(inc.amount), 0);
    };

    const getNetSavings = () => {
        const totalIncome = getTotalIncome();
        const totalExpenses = getTotalExpenses();
        return totalIncome - totalExpenses;
    };

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
