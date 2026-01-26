import React from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useBudget } from '../context/BudgetContext';
import { useGoals } from '../context/GoalsContext';
import Card from '../components/Card';
import { getAllInsights } from '../services/insightsService';
import './Insights.css';

const Insights = () => {
    const { expenses, income, categories } = useExpense();
    const { budgets } = useBudget();
    const { goals } = useGoals();

    const { patterns, insights } = getAllInsights(expenses, income, budgets, goals, categories);

    const getInsightColor = (type) => {
        switch (type) {
            case 'urgent': return 'var(--danger-600)';
            case 'warning': return 'var(--warning-600)';
            case 'success': return 'var(--success-600)';
            case 'info': return 'var(--primary-600)';
            case 'suggestion': return 'var(--primary-500)';
            default: return 'var(--text-primary)';
        }
    };

    const getInsightBg = (type) => {
        switch (type) {
            case 'urgent': return 'var(--danger-100)';
            case 'warning': return 'var(--warning-100)';
            case 'success': return 'var(--success-100)';
            case 'info': return 'var(--primary-100)';
            case 'suggestion': return 'var(--primary-50)';
            default: return 'var(--bg-tertiary)';
        }
    };

    if (expenses.length === 0 && income.length === 0) {
        return (
            <div className="insights-page">
                <div className="insights-container">
                    <div className="insights-header">
                        <h1 className="insights-title">Smart Insights</h1>
                        <p className="insights-subtitle">AI-powered financial recommendations</p>
                    </div>
                    <div className="insights-empty">
                        <div className="insights-empty-icon">💡</div>
                        <h3 className="insights-empty-title">No Insights Available</h3>
                        <p className="insights-empty-message">
                            Start adding transactions to receive personalized financial insights
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="insights-page">
            <div className="insights-container">
                <div className="insights-header">
                    <h1 className="insights-title">Smart Insights</h1>
                    <p className="insights-subtitle">AI-powered financial recommendations</p>
                </div>

                {/* Spending Patterns */}
                {patterns.length > 0 && (
                    <div className="insights-section">
                        <h2 className="insights-section-title">Spending Patterns</h2>
                        <div className="patterns-grid">
                            {patterns.map((pattern, index) => (
                                <Card key={index} className="pattern-card">
                                    {pattern.type === 'top_category' && (
                                        <>
                                            <div className="pattern-icon">{pattern.icon}</div>
                                            <div className="pattern-label">Top Category</div>
                                            <div className="pattern-value">{pattern.category}</div>
                                            <div className="pattern-meta">
                                                ₹{pattern.amount.toLocaleString('en-IN')} ({pattern.percentage}%)
                                            </div>
                                        </>
                                    )}
                                    {pattern.type === 'daily_average' && (
                                        <>
                                            <div className="pattern-icon">📅</div>
                                            <div className="pattern-label">Daily Average</div>
                                            <div className="pattern-value">₹{pattern.amount.toFixed(0)}</div>
                                            <div className="pattern-meta">{pattern.period}</div>
                                        </>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Insights & Recommendations */}
                <div className="insights-section">
                    <h2 className="insights-section-title">Recommendations</h2>
                    <div className="insights-list">
                        {insights.map((insight, index) => (
                            <Card
                                key={index}
                                className="insight-card"
                                style={{
                                    borderLeft: `4px solid ${getInsightColor(insight.type)}`,
                                    background: getInsightBg(insight.type)
                                }}
                            >
                                <div className="insight-header">
                                    <span className="insight-icon">{insight.icon}</span>
                                    <h3 className="insight-title">{insight.title}</h3>
                                </div>
                                <p className="insight-message">{insight.message}</p>
                                {insight.action && (
                                    <div className="insight-action">
                                        <strong>Action:</strong> {insight.action}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Insights;
