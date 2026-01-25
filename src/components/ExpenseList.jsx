import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import Card from './Card';
import Button from './Button';
import Modal from './Modal';
import ExpenseForm from './ExpenseForm';
import './ExpenseList.css';

const ExpenseList = () => {
    const { getFilteredExpenses, removeExpense, categories } = useExpense();
    const [editingExpense, setEditingExpense] = useState(null);
    const [deletingExpense, setDeletingExpense] = useState(null);

    const expenses = getFilteredExpenses();

    const getCategoryById = (categoryId) => {
        return categories.find(cat => cat.id === categoryId);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const handleDelete = () => {
        if (deletingExpense) {
            removeExpense(deletingExpense.id);
            setDeletingExpense(null);
        }
    };

    if (expenses.length === 0) {
        return (
            <div className="expense-list-empty">
                <div className="empty-icon">📊</div>
                <h3>No expenses yet</h3>
                <p>Start tracking by adding your first expense</p>
            </div>
        );
    }

    return (
        <>
            <div className="expense-list">
                {expenses.map(expense => {
                    const category = getCategoryById(expense.categoryId);

                    return (
                        <Card key={expense.id} className="expense-item" hoverable>
                            <div className="expense-item-main">
                                <div className="expense-category-icon" style={{ backgroundColor: category?.color + '20' }}>
                                    {category?.icon || '📝'}
                                </div>
                                <div className="expense-details">
                                    <div className="expense-category-name">{category?.name || 'Unknown'}</div>
                                    {expense.description && (
                                        <div className="expense-description">{expense.description}</div>
                                    )}
                                    <div className="expense-date">{formatDate(expense.date)}</div>
                                </div>
                                <div className="expense-amount">{formatAmount(expense.amount)}</div>
                            </div>
                            <div className="expense-actions">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingExpense(expense)}
                                    icon="✏️"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingExpense(expense)}
                                    icon="🗑️"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={!!editingExpense}
                onClose={() => setEditingExpense(null)}
                title="Edit Expense"
            >
                <ExpenseForm
                    expense={editingExpense}
                    onClose={() => setEditingExpense(null)}
                    onSuccess={() => setEditingExpense(null)}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deletingExpense}
                onClose={() => setDeletingExpense(null)}
                title="Delete Expense"
                size="sm"
            >
                <div className="delete-confirmation">
                    <p>Are you sure you want to delete this expense?</p>
                    {deletingExpense && (
                        <div className="delete-expense-preview">
                            <strong>{formatAmount(deletingExpense.amount)}</strong>
                            <span>{getCategoryById(deletingExpense.categoryId)?.name}</span>
                        </div>
                    )}
                    <div className="delete-actions">
                        <Button
                            variant="secondary"
                            onClick={() => setDeletingExpense(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ExpenseList;
