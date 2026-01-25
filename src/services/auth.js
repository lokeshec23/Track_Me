import { createUser, validateUser, getCurrentUser, setCurrentUser, clearCurrentUser } from './storage';

// Register a new user
export const register = async (userData) => {
    try {
        const user = createUser(userData);
        setCurrentUser(user);
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Login user
export const login = async (email, password) => {
    try {
        const user = validateUser(email, password);
        setCurrentUser(user);
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Logout user
export const logout = () => {
    clearCurrentUser();
    return { success: true };
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const user = getCurrentUser();
    return !!user;
};

// Get current authenticated user
export const getAuthUser = () => {
    return getCurrentUser();
};

export default {
    register,
    login,
    logout,
    isAuthenticated,
    getAuthUser
};
