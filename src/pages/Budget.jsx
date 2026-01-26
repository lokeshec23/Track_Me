import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { useExpense } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './Budget.css';

const Budget = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { categories } = useExpense();
    const {
        budgets,
        alerts,
        addBudget,
        editBudget,
        removeBudget,
        getAllUtilizations,
        getOverallBudgetStatus
    } = useBudget();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [formData, setFormData] = useState({
        categoryId: '',
        amount: '',
        period: 'monthly',
        alertThreshold: 80
    });
    const [errors, setErrors] = useState({});

    const utilizations = getAllUtilizations();
    const overallStatus = getOverallBudgetStatus();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getCategoryById = (categoryId) => {
        if (categoryId === 'overall') {
            return { id: 'overall', name: 'Overall Budget', icon: '💰', color: '#6366f1' };
        }
        return categories.find(cat => cat.id === categoryId);
    };

    const getProgressClass = (percentage) => {
        if (percentage >= 100) return 'danger';
        if (percentage >= 80) return 'warning';
        return 'normal';
    };

    const handleOpenAddModal = () => {
        setEditingBudget(null);
        setFormData({
            categoryId: '',
            amount: '',
            period: 'monthly',
            alertThreshold: 80
        });
        setErrors({});
        setShowAddModal(true);
    };

    const handleOpenEditModal = (budget) => {
        setEditingBudget(budget);
        setFormData({
            categoryId: budget.categoryId,
            amount: budget.amount,
            period: budget.period,
            alertThreshold: budget.alertThreshold
        });
        setErrors({});
        setShowAddModal(true);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category';
        }

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (editingBudget) {
            const result = editBudget(editingBudget.id, formData);
            if (!result.success) {
                setErrors({ general: result.error });
                return;
            }
        } else {
            const result = addBudget(formData);
            if (!result.success) {
                setErrors({ general: result.error });
                return;
            }
        }

        setShowAddModal(false);
    };

    const handleDelete = (budgetId) => {
        if (window.confirm('Are you sure you want to delete this budget?')) {
            removeBudget(budgetId);
        }
    };

    // Calculate total budgeted and spent
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = utilizations.reduce((sum, u) => sum + u.utilization.spent, 0);
    const totalRemaining = totalBudgeted - totalSpent;

    return (
        <div className="budget-page">
            <div className="budget-container">
                {/* Header */}
                <div className="budget-header">
                    <h1 className="budget-title">Budget Management</h1>
                    <p className="budget-subtitle">
                        Track and manage your spending limits
                    </p>
                </div>

                {/* Budget Alerts */}
                {alerts.length > 0 && (
                    <div className="budget-alerts">
                        {alerts.map((alert, index) => {
                            const category = getCategoryById(alert.categoryId);
                            return (
                                <div
                                    key={index}
                                    className={`budget-alert ${alert.type === 'over' ? 'danger' : 'warning'}`}
                                >
                                    <div className="budget-alert-icon">
                                        {alert.type === 'over' ? '🚨' : '⚠️'}
                                    </div>
                                    <div className="budget-alert-content">
                                        <div className="budget-alert-title">
                                            {alert.type === 'over' ? 'Budget Exceeded!' : 'Budget Alert'}
                                        </div>
                                        <div className="budget-alert-message">
                                            {category?.name}: {formatCurrency(alert.spent)} of {formatCurrency(alert.budgetAmount)} ({alert.percentage.toFixed(0)}%)
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Cards */}
                {budgets.length > 0 && (
                    <div className="budget-summary">
                        <Card className="budget-summary-card">
                            <div className="budget-summary-header">
                                <div className="budget-summary-icon">💰</div>
                                <div className="budget-summary-info">
                                    <h3>Total Budget</h3>
                                </div>
                            </div>
                            <div className="budget-summary-amount">
                                {formatCurrency(totalBudgeted)}
                            </div>
                            <div className="budget-summary-meta">
                                <span className="budget-summary-spent">
                                    Spent: <strong>{formatCurrency(totalSpent)}</strong>
                                </span>
                                <span className="budget-summary-remaining">
                                    Left: <strong>{formatCurrency(totalRemaining)}</strong>
                                </span>
                            </div>
                        </Card>

                        {overallStatus && (
                            <Card className="budget-summary-card">
                                <div className="budget-summary-header">
                                    <div className="budget-summary-icon">📊</div>
                                    <div className="budget-summary-info">
                                        <h3>Overall Progress</h3>
                                    </div>
                                </div>
                                <div className="budget-summary-amount">
                                    {overallStatus.percentage.toFixed(0)}%
                                </div>
                                <div className="budget-summary-meta">
                                    <span className={`budget-progress-percentage ${getProgressClass(overallStatus.percentage)}`}>
                                        {overallStatus.isOverBudget ? 'Over Budget' : overallStatus.isNearLimit ? 'Near Limit' : 'On Track'}
                                    </span>
                                </div>
                            </Card>
                        )}
                    </div>
                )}

                {/* Budget List */}
                <div className="budget-section">
                    <div className="budget-section-header">
                        <h2 className="budget-section-title">Your Budgets</h2>
                        <Button
                            variant="primary"
                            onClick={handleOpenAddModal}
                            icon="+"
                        >
                            Add Budget
                        </Button>
                    </div>

                    {budgets.length === 0 ? (
                        <div className="budget-empty">
                            <div className="budget-empty-icon">💸</div>
                            <h3 className="budget-empty-title">No Budgets Set</h3>
                            <p className="budget-empty-message">
                                Start managing your finances by setting up budgets for different categories
                            </p>
                            <Button
                                variant="primary"
                                onClick={handleOpenAddModal}
                                icon="+"
                            >
                                Create Your First Budget
                            </Button>
                        </div>
                    ) : (
                        <div className="budget-cards">
                            {utilizations.map(({ budget, utilization }) => {
                                const category = getCategoryById(budget.categoryId);
                                const progressClass = getProgressClass(utilization.percentage);

                                return (
                                    <Card key={budget.id} className="budget-card">
                                        <div className="budget-card-header">
                                            <div className="budget-card-info">
                                                <div className="budget-card-category">
                                                    <span className="budget-card-icon">
                                                        {category?.icon}
                                                    </span>
                                                    <span className="budget-card-name">
                                                        {category?.name}
                                                    </span>
                                                </div>
                                                <div className="budget-card-amount">
                                                    Budget: {formatCurrency(budget.amount)} / {budget.period}
                                                </div>
                                            </div>
                                            <div className="budget-card-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEditModal(budget)}
                                                    icon="✏️"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(budget.id)}
                                                    icon="🗑️"
                                                />
                                            </div>
                                        </div>

                                        <div className="budget-progress-section">
                                            <div className="budget-progress-info">
                                                <span className="budget-progress-label">
                                                    {utilization.expenseCount} expenses
                                                </span>
                                                <span className={`budget-progress-percentage ${progressClass}`}>
                                                    {utilization.percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="budget-progress-bar">
                                                <div
                                                    className={`budget-progress-fill ${progressClass}`}
                                                    style={{ width: `${Math.min(utilization.percentage, 100)}%` }}
                                                />
                                            </div>
                                            <div className="budget-progress-details">
                                                <span>Spent: {formatCurrency(utilization.spent)}</span>
                                                <span>Remaining: {formatCurrency(utilization.remaining)}</span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Budget Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={editingBudget ? 'Edit Budget' : 'Add New Budget'}
            >
                <form onSubmit={handleSubmit} className="expense-form">
                    {errors.general && (
                        <div className="form-error-banner">
                            {errors.general}
                        </div>
                    )}

                    <div className="input-wrapper">
                        <label className="input-label">
                            Category<span className="input-required">*</span>
                        </label>
                        <select
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleChange}
                            className={`input-field ${errors.categoryId ? 'input-error' : ''}`}
                            required
                        >
                            <option value="">Select a category</option>
                            <option value="overall">Overall Budget</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.categoryId && <span className="input-error-message">{errors.categoryId}</span>}
                    </div>

                    <Input
                        label="Budget Amount (₹)"
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        error={errors.amount}
                        icon="₹"
                        step="0.01"
                        min="0"
                        required
                    />

                    <div className="input-wrapper">
                        <label className="input-label">
                            Period<span className="input-required">*</span>
                        </label>
                        <select
                            name="period"
                            value={formData.period}
                            onChange={handleChange}
                            className="input-field"
                            required
                        >
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    <Input
                        label="Alert Threshold (%)"
                        type="number"
                        name="alertThreshold"
                        value={formData.alertThreshold}
                        onChange={handleChange}
                        placeholder="80"
                        icon="⚠️"
                        min="1"
                        max="100"
                        required
                    />

                    <div className="form-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowAddModal(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                        >
                            {editingBudget ? 'Update Budget' : 'Add Budget'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Budget;
