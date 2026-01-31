import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import Card from './Card';
import './SummaryCards.css';

const SummaryCards = () => {
    const { getTotalExpenses, getTotalIncome, getNetSavings, getExpensesByCategory, categories } = useExpense();

    const totalExpenses = getTotalExpenses();
    const totalIncome = getTotalIncome();
    const netSavings = getNetSavings();
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
        .slice(0, 2); // Show top 2 categories instead of 3 to make room for income/savings

    return (
        <div className="summary-cards">
            {/* Total Income Card */}
            <Card className="summary-card summary-card-income">
                <div className="summary-card-header">
                    <div className="summary-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>💰</div>
                    <div className="summary-card-label">Total Income</div>
                </div>
                <div className="summary-card-amount">{formatAmount(totalIncome)}</div>
            </Card>

            {/* Total Expenses Card */}
            <Card className="summary-card summary-card-expense">
                <div className="summary-card-header">
                    <div className="summary-card-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>💸</div>
                    <div className="summary-card-label">Total Expenses</div>
                </div>
                <div className="summary-card-amount">{formatAmount(totalExpenses)}</div>
            </Card>

            {/* Net Savings Card */}
            <Card className="summary-card summary-card-savings">
                <div className="summary-card-header">
                    <div className="summary-card-icon" style={{
                        background: netSavings >= 0
                            ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                            : 'linear-gradient(135deg, #f59e0b, #d97706)'
                    }}>
                        {netSavings >= 0 ? '📈' : '📉'}
                    </div>
                    <div className="summary-card-label">Net Savings</div>
                </div>
                <div className="summary-card-amount" style={{
                    color: netSavings >= 0 ? 'var(--success-600)' : 'var(--warning-600)'
                }}>
                    {formatAmount(netSavings)}
                </div>
            </Card>

            {/* Top Categories */}
            {topCategories.map(([categoryId, data]) => {
                const category = getCategoryById(categoryId);
                if (!category) return null;

                const percentage = totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;

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

            {/* Empty state if no expenses or income */}
            {topCategories.length === 0 && totalExpenses === 0 && totalIncome === 0 && (
                <Card className="summary-card summary-card-empty">
                    <div className="summary-card-empty-content">
                        <div className="summary-card-icon">📊</div>
                        <p>No transactions to display</p>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default SummaryCards;
