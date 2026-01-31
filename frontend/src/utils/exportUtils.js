// Export Utility - CSV and PDF generation for transactions and reports

/**
 * Export transactions to CSV format
 */
export const exportToCSV = (data, filename = 'transactions.csv') => {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    // Define CSV headers
    const headers = ['Date', 'Type', 'Category', 'Amount', 'Description'];

    // Convert data to CSV rows
    const csvRows = [
        headers.join(','),
        ...data.map(item => [
            item.date,
            item.type || 'expense',
            item.categoryName || item.categoryId,
            item.amount,
            `"${(item.description || '').replace(/"/g, '""')}"` // Escape quotes
        ].join(','))
    ];

    // Create CSV content
    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
};

/**
 * Export budget report to CSV
 */
export const exportBudgetReportCSV = (budgets, utilizations, filename = 'budget-report.csv') => {
    const headers = ['Category', 'Budget Amount', 'Spent', 'Remaining', 'Utilization %', 'Status'];

    const csvRows = [
        headers.join(','),
        ...utilizations.map(({ budget, utilization }) => [
            budget.categoryId === 'overall' ? 'Overall' : budget.categoryId,
            budget.amount,
            utilization.spent,
            utilization.remaining,
            utilization.percentage.toFixed(2),
            utilization.status
        ].join(','))
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
};

/**
 * Export goals report to CSV
 */
export const exportGoalsReportCSV = (goals, filename = 'goals-report.csv') => {
    const headers = ['Goal Name', 'Target Amount', 'Current Amount', 'Progress %', 'Remaining', 'Deadline', 'Status'];

    const csvRows = [
        headers.join(','),
        ...goals.map(goal => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = goal.targetAmount - goal.currentAmount;
            return [
                `"${goal.name}"`,
                goal.targetAmount,
                goal.currentAmount,
                progress.toFixed(2),
                remaining,
                goal.deadline || 'No deadline',
                goal.isCompleted ? 'Completed' : 'Active'
            ].join(',');
        })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
};

/**
 * Generate PDF report (simplified version using HTML to PDF approach)
 */
export const generatePDFReport = (reportData, filename = 'financial-report.pdf') => {
    const {
        title = 'Financial Report',
        period,
        totalIncome,
        totalExpenses,
        netSavings,
        transactions = [],
        budgets = [],
        goals = []
    } = reportData;

    // Create HTML content for PDF
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    color: #333;
                }
                h1 {
                    color: #6366f1;
                    border-bottom: 3px solid #6366f1;
                    padding-bottom: 10px;
                }
                h2 {
                    color: #4f46e5;
                    margin-top: 30px;
                }
                .summary {
                    background: #f3f4f6;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                }
                .summary-item {
                    display: flex;
                    justify-content: space-between;
                    margin: 10px 0;
                    font-size: 16px;
                }
                .summary-item strong {
                    font-weight: 600;
                }
                .positive {
                    color: #10b981;
                }
                .negative {
                    color: #ef4444;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                }
                th, td {
                    border: 1px solid #e5e7eb;
                    padding: 12px;
                    text-align: left;
                }
                th {
                    background: #6366f1;
                    color: white;
                    font-weight: 600;
                }
                tr:nth-child(even) {
                    background: #f9fafb;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #6b7280;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <h1>${title}</h1>
            <p><strong>Period:</strong> ${period || 'All Time'}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })}</p>

            <div class="summary">
                <h2>Financial Summary</h2>
                <div class="summary-item">
                    <span>Total Income:</span>
                    <strong class="positive">₹${totalIncome?.toLocaleString('en-IN') || 0}</strong>
                </div>
                <div class="summary-item">
                    <span>Total Expenses:</span>
                    <strong class="negative">₹${totalExpenses?.toLocaleString('en-IN') || 0}</strong>
                </div>
                <div class="summary-item">
                    <span>Net Savings:</span>
                    <strong class="${netSavings >= 0 ? 'positive' : 'negative'}">₹${netSavings?.toLocaleString('en-IN') || 0}</strong>
                </div>
            </div>

            ${transactions.length > 0 ? `
                <h2>Recent Transactions</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.slice(0, 20).map(t => `
                            <tr>
                                <td>${new Date(t.date).toLocaleDateString('en-IN')}</td>
                                <td>${t.type || 'Expense'}</td>
                                <td>${t.categoryName || t.categoryId}</td>
                                <td>${t.description || '-'}</td>
                                <td class="${t.type === 'income' ? 'positive' : 'negative'}">₹${parseFloat(t.amount).toLocaleString('en-IN')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : ''}

            ${budgets.length > 0 ? `
                <h2>Budget Overview</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Budget</th>
                            <th>Spent</th>
                            <th>Remaining</th>
                            <th>Utilization</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${budgets.map(b => `
                            <tr>
                                <td>${b.categoryName || b.categoryId}</td>
                                <td>₹${b.amount.toLocaleString('en-IN')}</td>
                                <td>₹${b.spent.toLocaleString('en-IN')}</td>
                                <td>₹${b.remaining.toLocaleString('en-IN')}</td>
                                <td>${b.percentage.toFixed(1)}%</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : ''}

            ${goals.length > 0 ? `
                <h2>Financial Goals</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Goal</th>
                            <th>Target</th>
                            <th>Current</th>
                            <th>Progress</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${goals.map(g => {
        const progress = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
        return `
                                <tr>
                                    <td>${g.name}</td>
                                    <td>₹${g.targetAmount.toLocaleString('en-IN')}</td>
                                    <td>₹${g.currentAmount.toLocaleString('en-IN')}</td>
                                    <td>${progress.toFixed(1)}%</td>
                                    <td>${g.isCompleted ? 'Completed' : 'Active'}</td>
                                </tr>
                            `;
    }).join('')}
                    </tbody>
                </table>
            ` : ''}

            <div class="footer">
                <p>Generated by Track_Me - Personal Finance Manager</p>
            </div>
        </body>
        </html>
    `;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
        printWindow.print();
    };
};

/**
 * Helper function to download file
 */
const downloadFile = (blob, filename) => {
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
};

/**
 * Export monthly summary
 */
export const exportMonthlySummary = (month, year, data) => {
    const filename = `monthly-summary-${year}-${String(month).padStart(2, '0')}.csv`;
    const headers = ['Metric', 'Value'];

    const csvRows = [
        headers.join(','),
        ['Month', `${year}-${String(month).padStart(2, '0')}`].join(','),
        ['Total Income', data.totalIncome].join(','),
        ['Total Expenses', data.totalExpenses].join(','),
        ['Net Savings', data.netSavings].join(','),
        ['Savings Rate', `${data.savingsRate}%`].join(','),
        ['Number of Transactions', data.transactionCount].join(',')
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
};

export default {
    exportToCSV,
    exportBudgetReportCSV,
    exportGoalsReportCSV,
    generatePDFReport,
    exportMonthlySummary
};
