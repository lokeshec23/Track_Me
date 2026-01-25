import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import Card from './Card';
import './SummaryCards.css';

const SummaryCards = () => {
    const { getTotalExpenses, getExpensesByCategory, categories } = useExpense();

    const total = getTotalExpenses();
    const byCategory = getExpensesByCategory();

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getCategoryById = (categoryId) => {
        return categories.find(cat => cat.id === categoryId);
    };

    const topCategories = Object.entries(byCategory)
        .sort(([, a], [, b]) => b.total - a.total)
        .slice(0, 3);

    return (
        <div className="summary-cards">
            {/* Total Expense Card */}
            <Card className="summary-card summary-card-total">
                <div className="summary-card-header">
                    <div className="summary-card-icon">💰</div>
                    <div className="summary-card-label">Total Expenses</div>
                </div>
                <div className="summary-card-amount">{formatAmount(total)}</div>
            </Card>

            {/* Top Categories */}
            {topCategories.map(([categoryId, data]) => {
                const category = getCategoryById(categoryId);
                if (!category) return null;

                const percentage = total > 0 ? (data.total / total) * 100 : 0;

                return (
                    <Card key={categoryId} className="summary-card">
                        <div className="summary-card-header">
                            <div
                                className="summary-card-icon"
                                style={{ backgroundColor: category.color + '20' }}
                            >
                                {category.icon}
                            </div>
                            <div className="summary-card-label">{category.name}</div>
                        </div>
                        <div className="summary-card-amount">{formatAmount(data.total)}</div>
                        <div className="summary-card-meta">
                            {data.count} {data.count === 1 ? 'expense' : 'expenses'} · {percentage.toFixed(0)}%
                        </div>
                        <div className="summary-card-progress">
                            <div
                                className="summary-card-progress-bar"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor: category.color
                                }}
                            />
                        </div>
                    </Card>
                );
            })}

            {/* Empty state if no expenses */}
            {topCategories.length === 0 && total === 0 && (
                <Card className="summary-card summary-card-empty">
                    <div className="summary-card-empty-content">
                        <div className="summary-card-icon">📊</div>
                        <p>No expenses to display</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SummaryCards;
