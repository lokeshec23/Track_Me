// Smart Insights Service - Analyze spending patterns and provide recommendations

/**
 * Analyze spending patterns
 */
export const analyzeSpendingPatterns = (expenses, categories) => {
    if (!expenses || expenses.length === 0) {
        return { patterns: [], insights: [] };
    }

    const patterns = [];
    const insights = [];

    // Group by category
    const byCategory = {};
    expenses.forEach(expense => {
        if (!byCategory[expense.categoryId]) {
            byCategory[expense.categoryId] = {
                total: 0,
                count: 0,
                expenses: []
            };
        }
        byCategory[expense.categoryId].total += parseFloat(expense.amount);
        byCategory[expense.categoryId].count += 1;
        byCategory[expense.categoryId].expenses.push(expense);
    });

    // Find top spending category
    const topCategory = Object.entries(byCategory)
        .sort(([, a], [, b]) => b.total - a.total)[0];

    if (topCategory) {
        const category = categories.find(c => c.id === topCategory[0]);
        const percentage = (topCategory[1].total / expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)) * 100;

        patterns.push({
            type: 'top_category',
            category: category?.name || 'Unknown',
            amount: topCategory[1].total,
            percentage: percentage.toFixed(1),
            icon: category?.icon || '📊'
        });

        insights.push({
            type: 'info',
            title: 'Top Spending Category',
            message: `You spend most on ${category?.name || 'Unknown'} (${percentage.toFixed(1)}% of total expenses)`,
            icon: '📊'
        });
    }

    // Check for unusual spending
    const avgExpense = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0) / expenses.length;
    const highExpenses = expenses.filter(e => parseFloat(e.amount) > avgExpense * 2);

    if (highExpenses.length > 0) {
        insights.push({
            type: 'warning',
            title: 'High Spending Alert',
            message: `You have ${highExpenses.length} transaction(s) significantly above average`,
            icon: '⚠️'
        });
    }

    // Analyze frequency
    const last30Days = expenses.filter(e => {
        const expenseDate = new Date(e.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return expenseDate >= thirtyDaysAgo;
    });

    if (last30Days.length > 0) {
        const dailyAvg = last30Days.reduce((sum, e) => sum + parseFloat(e.amount), 0) / 30;
        patterns.push({
            type: 'daily_average',
            amount: dailyAvg,
            period: 'last 30 days'
        });
    }

    return { patterns, insights };
};

/**
 * Generate budget recommendations
 */
export const generateBudgetRecommendations = (expenses, income, budgets, categories) => {
    const recommendations = [];
    const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

    // 50/30/20 rule recommendation
    const needs = totalIncome * 0.5;
    const wants = totalIncome * 0.3;
    const savings = totalIncome * 0.2;

    if (totalExpenses > needs + wants) {
        recommendations.push({
            type: 'warning',
            title: '50/30/20 Rule',
            message: `Consider the 50/30/20 rule: 50% needs (₹${needs.toFixed(0)}), 30% wants (₹${wants.toFixed(0)}), 20% savings (₹${savings.toFixed(0)})`,
            icon: '💡'
        });
    }

    // Category-specific recommendations
    const byCategory = {};
    expenses.forEach(expense => {
        if (!byCategory[expense.categoryId]) {
            byCategory[expense.categoryId] = 0;
        }
        byCategory[expense.categoryId] += parseFloat(expense.amount);
    });

    Object.entries(byCategory).forEach(([categoryId, total]) => {
        const category = categories.find(c => c.id === categoryId);
        const percentage = (total / totalExpenses) * 100;

        if (percentage > 40) {
            recommendations.push({
                type: 'warning',
                title: `High ${category?.name || 'Category'} Spending`,
                message: `${category?.name || 'This category'} accounts for ${percentage.toFixed(1)}% of your expenses. Consider setting a budget.`,
                icon: '⚠️'
            });
        }

        // Check if no budget exists for high-spending category
        const hasBudget = budgets.some(b => b.categoryId === categoryId);
        if (percentage > 20 && !hasBudget) {
            recommendations.push({
                type: 'suggestion',
                title: `Budget Suggestion for ${category?.name || 'Category'}`,
                message: `Consider setting a budget for ${category?.name || 'this category'} (currently ₹${total.toFixed(0)}/month)`,
                icon: '💸'
            });
        }
    });

    return recommendations;
};

/**
 * Generate savings suggestions
 */
export const generateSavingsSuggestions = (expenses, income, goals) => {
    const suggestions = [];
    const totalIncome = income.reduce((sum, i) => sum + parseFloat(i.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    const currentSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (currentSavings / totalIncome) * 100 : 0;

    // Savings rate feedback
    if (savingsRate < 10) {
        suggestions.push({
            type: 'urgent',
            title: 'Low Savings Rate',
            message: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for at least 20% to build financial security.`,
            icon: '🚨',
            action: 'Review expenses and find areas to cut back'
        });
    } else if (savingsRate < 20) {
        suggestions.push({
            type: 'warning',
            title: 'Improve Savings Rate',
            message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to increase it to 20% or more.`,
            icon: '📈',
            action: 'Identify non-essential expenses to reduce'
        });
    } else {
        suggestions.push({
            type: 'success',
            title: 'Great Savings Rate!',
            message: `You're saving ${savingsRate.toFixed(1)}% of your income. Keep it up!`,
            icon: '🎉',
            action: 'Consider investing surplus savings'
        });
    }

    // Goal-based suggestions
    const activeGoals = goals.filter(g => !g.isCompleted);
    if (activeGoals.length > 0 && currentSavings > 0) {
        const totalGoalRemaining = activeGoals.reduce((sum, g) => sum + (g.targetAmount - g.currentAmount), 0);
        const monthsToComplete = totalGoalRemaining / currentSavings;

        suggestions.push({
            type: 'info',
            title: 'Goal Progress',
            message: `At your current savings rate, you'll complete all goals in ${Math.ceil(monthsToComplete)} months.`,
            icon: '🎯',
            action: 'Increase savings to reach goals faster'
        });
    }

    // Emergency fund suggestion
    const hasEmergencyGoal = goals.some(g => g.category === 'emergency');
    if (!hasEmergencyGoal) {
        const emergencyFundTarget = totalExpenses * 6; // 6 months of expenses
        suggestions.push({
            type: 'suggestion',
            title: 'Emergency Fund',
            message: `Consider creating an emergency fund goal of ₹${emergencyFundTarget.toFixed(0)} (6 months of expenses).`,
            icon: '🚨',
            action: 'Create an emergency fund goal'
        });
    }

    return suggestions;
};

/**
 * Get all insights
 */
export const getAllInsights = (expenses, income, budgets, goals, categories) => {
    const { patterns, insights: spendingInsights } = analyzeSpendingPatterns(expenses, categories);
    const budgetRecommendations = generateBudgetRecommendations(expenses, income, budgets, categories);
    const savingsSuggestions = generateSavingsSuggestions(expenses, income, goals);

    return {
        patterns,
        insights: [...spendingInsights, ...budgetRecommendations, ...savingsSuggestions]
    };
};

export default {
    analyzeSpendingPatterns,
    generateBudgetRecommendations,
    generateSavingsSuggestions,
    getAllInsights
};
