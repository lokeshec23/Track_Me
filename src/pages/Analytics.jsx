import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import { useBudget } from '../context/BudgetContext';
import Card from '../components/Card';
import './Analytics.css';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
    const { expenses, income, categories, incomeCategories, getTotalExpenses, getTotalIncome } = useExpense();
    const { budgets, getAllUtilizations } = useBudget();

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    // Monthly trend data
    const monthlyData = useMemo(() => {
        const last6Months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-IN', { month: 'short' });

            const monthExpenses = expenses.filter(e => e.date.startsWith(monthKey));
            const monthIncome = income.filter(i => i.date.startsWith(monthKey));

            last6Months.push({
                month: monthName,
                expenses: monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
                income: monthIncome.reduce((sum, i) => sum + parseFloat(i.amount), 0)
            });
        }

        return last6Months;
    }, [expenses, income]);

    // Category breakdown
    const categoryData = useMemo(() => {
        const categoryTotals = {};

        expenses.forEach(expense => {
            if (!categoryTotals[expense.categoryId]) {
                const category = categories.find(c => c.id === expense.categoryId);
                categoryTotals[expense.categoryId] = {
                    name: category?.name || 'Unknown',
                    value: 0,
                    color: category?.color || '#64748b'
                };
            }
            categoryTotals[expense.categoryId].value += parseFloat(expense.amount);
        });

        return Object.values(categoryTotals).sort((a, b) => b.value - a.value);
    }, [expenses, categories]);

    // Budget utilization
    const budgetData = useMemo(() => {
        const utilizations = getAllUtilizations();
        return utilizations.map(({ budget, utilization }) => {
            const category = categories.find(c => c.id === budget.categoryId);
            return {
                name: category?.name || budget.categoryId === 'overall' ? 'Overall' : 'Unknown',
                budgeted: budget.amount,
                spent: utilization.spent,
                percentage: utilization.percentage
            };
        });
    }, [budgets, getAllUtilizations, categories]);

    // Income vs Expense comparison
    const comparisonData = useMemo(() => {
        return [{
            name: 'This Month',
            income: getTotalIncome(),
            expenses: getTotalExpenses(),
            savings: getTotalIncome() - getTotalExpenses()
        }];
    }, [getTotalIncome, getTotalExpenses]);

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

    const totalExpenses = getTotalExpenses();
    const totalIncome = getTotalIncome();
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    if (expenses.length === 0 && income.length === 0) {
        return (
            <div className="analytics-page">
                <div className="analytics-container">
                    <div className="analytics-header">
                        <h1 className="analytics-title">Analytics</h1>
                        <p className="analytics-subtitle">Visual insights into your finances</p>
                    </div>
                    <div className="analytics-empty">
                        <div className="analytics-empty-icon">📊</div>
                        <h3 className="analytics-empty-title">No Data Available</h3>
                        <p className="analytics-empty-message">
                            Start adding transactions to see your financial analytics
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <div className="analytics-container">
                <div className="analytics-header">
                    <h1 className="analytics-title">Analytics</h1>
                    <p className="analytics-subtitle">Visual insights into your finances</p>
                </div>

                {/* Summary Stats */}
                <div className="analytics-stats">
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-label">Total Income</div>
                        <div className="analytics-stat-value" style={{ color: 'var(--success-600)' }}>
                            {formatCurrency(totalIncome)}
                        </div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-label">Total Expenses</div>
                        <div className="analytics-stat-value" style={{ color: 'var(--danger-600)' }}>
                            {formatCurrency(totalExpenses)}
                        </div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-label">Net Savings</div>
                        <div className="analytics-stat-value" style={{ color: netSavings >= 0 ? 'var(--success-600)' : 'var(--danger-600)' }}>
                            {formatCurrency(netSavings)}
                        </div>
                    </Card>
                    <Card className="analytics-stat-card">
                        <div className="analytics-stat-label">Savings Rate</div>
                        <div className="analytics-stat-value" style={{ color: savingsRate >= 20 ? 'var(--success-600)' : 'var(--warning-600)' }}>
                            {savingsRate.toFixed(1)}%
                        </div>
                    </Card>
                </div>

                {/* Monthly Trend */}
                <div className="analytics-section">
                    <h2 className="analytics-section-title">6-Month Trend</h2>
                    <Card className="chart-card">
                        <div className="chart-card-header">
                            <h3 className="chart-card-title">Income vs Expenses</h3>
                        </div>
                        <div className="chart-wrapper">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                    <XAxis dataKey="month" stroke="var(--text-secondary)" />
                                    <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(value)}
                                        contentStyle={{
                                            backgroundColor: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Charts Grid */}
                <div className="charts-grid">
                    {/* Category Breakdown */}
                    {categoryData.length > 0 && (
                        <Card className="chart-card">
                            <div className="chart-card-header">
                                <h3 className="chart-card-title">Expense by Category</h3>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}

                    {/* Budget Utilization */}
                    {budgetData.length > 0 && (
                        <Card className="chart-card">
                            <div className="chart-card-header">
                                <h3 className="chart-card-title">Budget Utilization</h3>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={budgetData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                                        <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                        <YAxis stroke="var(--text-secondary)" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                                        <Tooltip
                                            formatter={(value) => formatCurrency(value)}
                                            contentStyle={{
                                                backgroundColor: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: 'var(--radius-md)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="budgeted" fill="#6366f1" name="Budget" />
                                        <Bar dataKey="spent" fill="#ef4444" name="Spent" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Analytics;
