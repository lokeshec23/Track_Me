// Local Storage Service for managing app data

const STORAGE_KEYS = {
    USERS: 'trackme_users',
    CURRENT_USER: 'trackme_current_user',
    EXPENSES: 'trackme_expenses',
    CATEGORIES: 'trackme_categories',
    THEME: 'trackme_theme'
};

// Default expense categories
const DEFAULT_CATEGORIES = [
    { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#f59e0b' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: '#3b82f6' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#ec4899' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#8b5cf6' },
    { id: 'bills', name: 'Bills & Utilities', icon: '💡', color: '#ef4444' },
    { id: 'health', name: 'Healthcare', icon: '⚕️', color: '#10b981' },
    { id: 'education', name: 'Education', icon: '📚', color: '#6366f1' },
    { id: 'other', name: 'Other', icon: '📝', color: '#64748b' }
];

// Simple hash function for passwords (NOT for production use)
const hashPassword = (password) => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
};

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

// Remove data from localStorage
const removeItem = (key) => {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
        return false;
    }
};

// Initialize default categories if not exists
export const initializeCategories = () => {
    const categories = getItem(STORAGE_KEYS.CATEGORIES);
    if (!categories) {
        setItem(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    }
};

// User Management
export const getUsers = () => {
    return getItem(STORAGE_KEYS.USERS) || [];
};

export const createUser = (userData) => {
    const users = getUsers();

    // Check if user already exists
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: hashPassword(userData.password),
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);

    return { ...newUser, password: undefined }; // Don't return password
};

export const validateUser = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === hashPassword(password));

    if (!user) {
        throw new Error('Invalid email or password');
    }

    return { ...user, password: undefined }; // Don't return password
};

// Current User Session
export const getCurrentUser = () => {
    return getItem(STORAGE_KEYS.CURRENT_USER);
};

export const setCurrentUser = (user) => {
    return setItem(STORAGE_KEYS.CURRENT_USER, user);
};

export const clearCurrentUser = () => {
    return removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Expense Management
export const getExpenses = (userId) => {
    const allExpenses = getItem(STORAGE_KEYS.EXPENSES) || [];
    return allExpenses.filter(expense => expense.userId === userId);
};

export const createExpense = (expenseData) => {
    const allExpenses = getItem(STORAGE_KEYS.EXPENSES) || [];

    const newExpense = {
        id: Date.now().toString(),
        ...expenseData,
        createdAt: new Date().toISOString()
    };

    allExpenses.push(newExpense);
    setItem(STORAGE_KEYS.EXPENSES, allExpenses);

    return newExpense;
};

export const updateExpense = (expenseId, updates) => {
    const allExpenses = getItem(STORAGE_KEYS.EXPENSES) || [];
    const index = allExpenses.findIndex(e => e.id === expenseId);

    if (index === -1) {
        throw new Error('Expense not found');
    }

    allExpenses[index] = {
        ...allExpenses[index],
        ...updates,
        updatedAt: new Date().toISOString()
    };

    setItem(STORAGE_KEYS.EXPENSES, allExpenses);
    return allExpenses[index];
};

export const deleteExpense = (expenseId) => {
    const allExpenses = getItem(STORAGE_KEYS.EXPENSES) || [];
    const filteredExpenses = allExpenses.filter(e => e.id !== expenseId);

    setItem(STORAGE_KEYS.EXPENSES, filteredExpenses);
    return true;
};

// Category Management
export const getCategories = () => {
    const categories = getItem(STORAGE_KEYS.CATEGORIES);
    return categories || DEFAULT_CATEGORIES;
};

export const createCategory = (categoryData) => {
    const categories = getCategories();

    const newCategory = {
        id: Date.now().toString(),
        ...categoryData,
        isCustom: true
    };

    categories.push(newCategory);
    setItem(STORAGE_KEYS.CATEGORIES, categories);

    return newCategory;
};

export const deleteCategory = (categoryId) => {
    const categories = getCategories();
    const filteredCategories = categories.filter(c => c.id !== categoryId);

    setItem(STORAGE_KEYS.CATEGORIES, filteredCategories);
    return true;
};

// Theme Management
export const getTheme = () => {
    return getItem(STORAGE_KEYS.THEME) || 'light';
};

export const setTheme = (theme) => {
    return setItem(STORAGE_KEYS.THEME, theme);
};

export default {
    initializeCategories,
    getUsers,
    createUser,
    validateUser,
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getCategories,
    createCategory,
    deleteCategory,
    getTheme,
    setTheme
};
