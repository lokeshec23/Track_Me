import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useExpense } from '../context/ExpenseContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import ExpenseForm from '../components/ExpenseForm';
import IncomeForm from '../components/IncomeForm';
import ExpenseList from '../components/ExpenseList';
import SummaryCards from '../components/SummaryCards';
import DateRangePicker from '../components/DateRangePicker';
import './Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { categories, selectedCategory, setSelectedCategory } = useExpense();
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddIncome, setShowAddIncome] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="dashboard-header-content">
                    <div className="dashboard-logo">
                        <span className="dashboard-logo-icon">💰</span>
                        <h1 className="dashboard-logo-text">Track Me</h1>
                    </div>

                    <div className="dashboard-header-actions">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/budget')}
                            icon="💸"
                            className="budget-button"
                        >
                            Budget
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/recurring')}
                            icon="🔄"
                            className="recurring-button"
                        >
                            Recurring
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/goals')}
                            icon="🎯"
                            className="goals-button"
                        >
                            Goals
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/analytics')}
                            icon="📊"
                            className="analytics-button"
                        >
                            Analytics
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/settings')}
                            icon="⚙️"
                            className="settings-button"
                        >
                            Settings
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleTheme}
                            icon={theme === 'dark' ? '☀️' : '🌙'}
                            className="theme-toggle"
                        >
                            {theme === 'dark' ? 'Light' : 'Dark'}
                        </Button>
                        <div className="dashboard-user">
                            <span className="dashboard-user-name">{user?.name}</span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                icon="🚪"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="dashboard-container">
                    {/* Welcome Section */}
                    <div className="dashboard-welcome">
                        <h2 className="dashboard-welcome-title">
                            Welcome back, {user?.name?.split(' ')[0]}! 👋
                        </h2>
                        <p className="dashboard-welcome-subtitle">
                            Here's your expense overview
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <SummaryCards />

                    {/* Filters Section */}
                    <div className="dashboard-filters">
                        <DateRangePicker />

                        {/* Category Filter */}
                        <div className="category-filter">
                            <label className="category-filter-label">Filter by Category</label>
                            <div className="category-filter-buttons">
                                <Button
                                    variant={selectedCategory === null ? 'primary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(null)}
                                >
                                    All
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat.id}
                                        variant={selectedCategory === cat.id ? 'primary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(cat.id)}
                                        icon={cat.icon}
                                    >
                                        {cat.name}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Expense List Section */}
                    <div className="dashboard-expenses">
                        <div className="dashboard-expenses-header">
                            <h3 className="dashboard-expenses-title">Recent Transactions</h3>
                            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowAddIncome(true)}
                                    icon="+"
                                >
                                    Add Income
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setShowAddExpense(true)}
                                    icon="+"
                                >
                                    Add Expense
                                </Button>
                            </div>
                        </div>

                        <ExpenseList />
                    </div>
                </div>
            </main>

            {/* Add Expense Modal */}
            <Modal
                isOpen={showAddExpense}
                onClose={() => setShowAddExpense(false)}
                title="Add New Expense"
            >
                <ExpenseForm
                    onClose={() => setShowAddExpense(false)}
                    onSuccess={() => setShowAddExpense(false)}
                />
            </Modal>

            {/* Add Income Modal */}
            <Modal
                isOpen={showAddIncome}
                onClose={() => setShowAddIncome(false)}
                title="Add New Income"
            >
                <IncomeForm
                    onClose={() => setShowAddIncome(false)}
                    onSuccess={() => setShowAddIncome(false)}
                />
            </Modal>

            {/* Floating Add Button (Mobile) */}
            <button
                className="dashboard-fab"
                onClick={() => setShowAddExpense(true)}
                aria-label="Add expense"
            >
                +
            </button>
        </div>
    );
};

export default Dashboard;
