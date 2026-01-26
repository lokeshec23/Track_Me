import React, { useState } from 'react';
import { useRecurring } from '../context/RecurringContext';
import { useExpense } from '../context/ExpenseContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './Recurring.css';

const RecurringForm = ({ recurring = null, onClose, onSuccess }) => {
    const { addRecurring, editRecurring } = useRecurring();
    const { categories, incomeCategories } = useExpense();

    const [formData, setFormData] = useState({
        type: recurring?.type || 'expense',
        amount: recurring?.amount || '',
        categoryId: recurring?.categoryId || '',
        description: recurring?.description || '',
        frequency: recurring?.frequency || 'monthly',
        startDate: recurring?.startDate?.split('T')[0] || new Date().toISOString().split('T')[0],
        endDate: recurring?.endDate?.split('T')[0] || ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid amount';
        }

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a category';
        }

        if (!formData.description) {
            newErrors.description = 'Please enter a description';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);

        try {
            let result;
            if (recurring) {
                result = editRecurring(recurring.id, formData);
            } else {
                result = addRecurring(formData);
            }

            if (!result.success) {
                setErrors({ general: result.error });
                setLoading(false);
                return;
            }

            if (onSuccess) onSuccess();
            if (onClose) onClose();
        } catch (error) {
            setErrors({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    const currentCategories = formData.type === 'expense' ? categories : incomeCategories;

    return (
        <form onSubmit={handleSubmit} className="expense-form">
            {errors.general && (
                <div className="form-error-banner">
                    {errors.general}
                </div>
            )}

            <div className="input-wrapper">
                <label className="input-label">
                    Type<span className="input-required">*</span>
                </label>
                <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="input-field"
                    required
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
            </div>

            <Input
                label="Amount (₹)"
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
                    {currentCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                        </option>
                    ))}
                </select>
                {errors.categoryId && <span className="input-error-message">{errors.categoryId}</span>}
            </div>

            <Input
                label="Description"
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g., Monthly rent"
                error={errors.description}
                required
            />

            <div className="input-wrapper">
                <label className="input-label">
                    Frequency<span className="input-required">*</span>
                </label>
                <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleChange}
                    className="input-field"
                    required
                >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
            </div>

            <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                icon="📅"
                required
            />

            <Input
                label="End Date (Optional)"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                icon="📅"
            />

            <div className="form-actions">
                {onClose && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    fullWidth={!onClose}
                >
                    {recurring ? 'Update Recurring' : 'Add Recurring'}
                </Button>
            </div>
        </form>
    );
};

const Recurring = () => {
    const { recurring, stats, removeRecurring, toggleStatus, getRecurringWithNextDate } = useRecurring();
    const { categories, incomeCategories } = useExpense();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingRecurring, setEditingRecurring] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryById = (categoryId, type) => {
        const cats = type === 'expense' ? categories : incomeCategories;
        return cats.find(cat => cat.id === categoryId);
    };

    const handleEdit = (rec) => {
        setEditingRecurring(rec);
        setShowAddModal(true);
    };

    const handleDelete = (recurringId) => {
        if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
            removeRecurring(recurringId);
        }
    };

    const handleToggleStatus = (recurringId) => {
        toggleStatus(recurringId);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingRecurring(null);
    };

    const recurringWithDates = getRecurringWithNextDate();

    return (
        <div className="recurring-page">
            <div className="recurring-container">
                {/* Header */}
                <div className="recurring-header">
                    <h1 className="recurring-title">Recurring Transactions</h1>
                    <p className="recurring-subtitle">
                        Manage your automatic income and expenses
                    </p>
                </div>

                {/* Stats */}
                <div className="recurring-stats">
                    <Card className="recurring-stat-card">
                        <div className="recurring-stat-label">Total Active</div>
                        <div className="recurring-stat-value">{stats.active}</div>
                    </Card>
                    <Card className="recurring-stat-card">
                        <div className="recurring-stat-label">Monthly Expenses</div>
                        <div className="recurring-stat-value negative">
                            {formatCurrency(stats.monthlyExpenses)}
                        </div>
                    </Card>
                    <Card className="recurring-stat-card">
                        <div className="recurring-stat-label">Monthly Income</div>
                        <div className="recurring-stat-value positive">
                            {formatCurrency(stats.monthlyIncome)}
                        </div>
                    </Card>
                    <Card className="recurring-stat-card">
                        <div className="recurring-stat-label">Net Impact</div>
                        <div className={`recurring-stat-value ${stats.monthlyNet >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(stats.monthlyNet)}
                        </div>
                    </Card>
                </div>

                {/* Recurring List */}
                <div className="recurring-section">
                    <div className="recurring-section-header">
                        <h2 className="recurring-section-title">Your Recurring Transactions</h2>
                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                            icon="+"
                        >
                            Add Recurring
                        </Button>
                    </div>

                    {recurring.length === 0 ? (
                        <div className="recurring-empty">
                            <div className="recurring-empty-icon">🔄</div>
                            <h3 className="recurring-empty-title">No Recurring Transactions</h3>
                            <p className="recurring-empty-message">
                                Set up automatic transactions for bills, subscriptions, salary, and more
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => setShowAddModal(true)}
                                icon="+"
                            >
                                Add Your First Recurring Transaction
                            </Button>
                        </div>
                    ) : (
                        <div className="recurring-list">
                            {recurringWithDates.map((rec) => {
                                const category = getCategoryById(rec.categoryId, rec.type);

                                return (
                                    <Card key={rec.id} className={`recurring-item ${!rec.isActive ? 'inactive' : ''}`}>
                                        <div className="recurring-item-header">
                                            <div className="recurring-item-info">
                                                <div className="recurring-item-title">
                                                    <span className="recurring-item-icon">{category?.icon}</span>
                                                    <span className="recurring-item-name">{rec.description}</span>
                                                    <span className={`recurring-item-type ${rec.type}`}>
                                                        {rec.type}
                                                    </span>
                                                </div>
                                                {category && (
                                                    <div className="recurring-item-description">
                                                        {category.name}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="recurring-item-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(rec.id)}
                                                    icon={rec.isActive ? '⏸️' : '▶️'}
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(rec)}
                                                    icon="✏️"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(rec.id)}
                                                    icon="🗑️"
                                                />
                                            </div>
                                        </div>

                                        <div className="recurring-item-details">
                                            <div className="recurring-item-detail">
                                                <span className="recurring-item-detail-label">Amount</span>
                                                <span className={`recurring-item-detail-value recurring-item-amount ${rec.type}`}>
                                                    {formatCurrency(rec.amount)}
                                                </span>
                                            </div>
                                            <div className="recurring-item-detail">
                                                <span className="recurring-item-detail-label">Frequency</span>
                                                <span className="recurring-item-detail-value">
                                                    <span className="frequency-badge">
                                                        🔄 {rec.frequency}
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="recurring-item-detail">
                                                <span className="recurring-item-detail-label">Next Occurrence</span>
                                                <span className="recurring-item-detail-value">
                                                    {rec.nextOccurrence ? formatDate(rec.nextOccurrence) : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="recurring-item-detail">
                                                <span className="recurring-item-detail-label">Status</span>
                                                <span className="recurring-item-detail-value">
                                                    <span className={`status-badge ${rec.isActive ? 'active' : 'paused'}`}>
                                                        {rec.isActive ? '✓ Active' : '⏸ Paused'}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={handleCloseModal}
                title={editingRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
            >
                <RecurringForm
                    recurring={editingRecurring}
                    onClose={handleCloseModal}
                    onSuccess={handleCloseModal}
                />
            </Modal>
        </div>
    );
};

export default Recurring;
