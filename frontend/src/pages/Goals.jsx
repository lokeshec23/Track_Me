import React, { useState } from 'react';
import { useGoals } from '../context/GoalsContext';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import Input from '../components/Input';
import './Goals.css';

const GOAL_CATEGORIES = [
    { id: 'emergency', name: 'Emergency Fund', icon: '🚨', color: '#ef4444' },
    { id: 'vacation', name: 'Vacation', icon: '✈️', color: '#3b82f6' },
    { id: 'purchase', name: 'Big Purchase', icon: '🛍️', color: '#ec4899' },
    { id: 'investment', name: 'Investment', icon: '📈', color: '#10b981' },
    { id: 'education', name: 'Education', icon: '📚', color: '#6366f1' },
    { id: 'other', name: 'Other', icon: '🎯', color: '#8b5cf6' }
];

const GoalForm = ({ goal = null, onClose, onSuccess }) => {
    const { addGoal, editGoal } = useGoals();
    const [formData, setFormData] = useState({
        name: goal?.name || '',
        targetAmount: goal?.targetAmount || '',
        currentAmount: goal?.currentAmount || 0,
        deadline: goal?.deadline?.split('T')[0] || '',
        category: goal?.category || 'other'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const selectedCategory = GOAL_CATEGORIES.find(c => c.id === formData.category);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Please enter a goal name';
        if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
            newErrors.targetAmount = 'Please enter a valid target amount';
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
            const goalData = {
                ...formData,
                icon: selectedCategory.icon,
                color: selectedCategory.color
            };

            const result = goal ? editGoal(goal.id, goalData) : addGoal(goalData);
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

    return (
        <form onSubmit={handleSubmit} className="expense-form">
            {errors.general && <div className="form-error-banner">{errors.general}</div>}

            <Input
                label="Goal Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Emergency Fund"
                error={errors.name}
                required
            />

            <Input
                label="Target Amount (₹)"
                type="number"
                name="targetAmount"
                value={formData.targetAmount}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.targetAmount}
                icon="₹"
                step="0.01"
                min="0"
                required
            />

            <Input
                label="Current Amount (₹)"
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                placeholder="0.00"
                icon="₹"
                step="0.01"
                min="0"
            />

            <div className="input-wrapper">
                <label className="input-label">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                    {GOAL_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                    ))}
                </select>
            </div>

            <Input
                label="Deadline (Optional)"
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                icon="📅"
            />

            <div className="form-actions">
                {onClose && <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>}
                <Button type="submit" variant="primary" loading={loading} fullWidth={!onClose}>
                    {goal ? 'Update Goal' : 'Create Goal'}
                </Button>
            </div>
        </form>
    );
};

const ContributeModal = ({ goal, onClose, onSuccess }) => {
    const { contribute } = useGoals();
    const [amount, setAmount] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        setLoading(true);
        const result = contribute(goal.id, amount);
        setLoading(false);

        if (!result.success) {
            setError(result.error);
            return;
        }

        if (onSuccess) onSuccess();
        if (onClose) onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="expense-form">
            <h3 style={{ marginBottom: 'var(--spacing-md)' }}>Add Contribution to {goal.name}</h3>
            <Input
                label="Contribution Amount (₹)"
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder="0.00"
                error={error}
                icon="₹"
                step="0.01"
                min="0"
                required
            />
            <div className="form-actions">
                <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button type="submit" variant="primary" loading={loading}>Add Contribution</Button>
            </div>
        </form>
    );
};

const Goals = () => {
    const { goals, stats, removeGoal, getGoalsWithProgress } = useGoals();
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);
    const [contributingGoal, setContributingGoal] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No deadline';
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleEdit = (goal) => {
        setEditingGoal(goal);
        setShowAddModal(true);
    };

    const handleDelete = (goalId) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            removeGoal(goalId);
        }
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingGoal(null);
    };

    const goalsWithProgress = getGoalsWithProgress();
    const activeGoals = goalsWithProgress.filter(g => !g.isCompleted);
    const completedGoals = goalsWithProgress.filter(g => g.isCompleted);

    return (
        <div className="goals-page">
            <div className="goals-container">
                <div className="goals-header">
                    <h1 className="goals-title">Financial Goals</h1>
                    <p className="goals-subtitle">Track your savings goals and achieve your dreams</p>
                </div>

                <div className="goals-stats">
                    <Card className="goals-stat-card">
                        <div className="goals-stat-label">Total Goals</div>
                        <div className="goals-stat-value">{stats.total}</div>
                    </Card>
                    <Card className="goals-stat-card">
                        <div className="goals-stat-label">Active</div>
                        <div className="goals-stat-value">{stats.active}</div>
                    </Card>
                    <Card className="goals-stat-card">
                        <div className="goals-stat-label">Completed</div>
                        <div className="goals-stat-value">{stats.completed}</div>
                    </Card>
                    <Card className="goals-stat-card">
                        <div className="goals-stat-label">Overall Progress</div>
                        <div className="goals-stat-value">{stats.overallProgress.toFixed(0)}%</div>
                    </Card>
                </div>

                <div className="goals-section">
                    <div className="goals-section-header">
                        <h2 className="goals-section-title">Active Goals</h2>
                        <Button variant="primary" onClick={() => setShowAddModal(true)} icon="+">Add Goal</Button>
                    </div>

                    {goals.length === 0 ? (
                        <div className="goals-empty">
                            <div className="goals-empty-icon">🎯</div>
                            <h3 className="goals-empty-title">No Goals Yet</h3>
                            <p className="goals-empty-message">Start setting financial goals to track your savings progress</p>
                            <Button variant="primary" onClick={() => setShowAddModal(true)} icon="+">Create Your First Goal</Button>
                        </div>
                    ) : (
                        <>
                            {activeGoals.length > 0 && (
                                <div className="goals-grid">
                                    {activeGoals.map((goal) => (
                                        <Card key={goal.id} className="goal-card">
                                            <div className="goal-card-header">
                                                <div className="goal-card-info">
                                                    <div className="goal-card-title">
                                                        <span className="goal-card-icon">{goal.icon}</span>
                                                        <span className="goal-card-name">{goal.name}</span>
                                                    </div>
                                                    <div className="goal-card-category">{goal.category}</div>
                                                </div>
                                                <div className="goal-card-actions">
                                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(goal)} icon="✏️" />
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} icon="🗑️" />
                                                </div>
                                            </div>

                                            <div className="goal-progress-section">
                                                <div className="goal-amounts">
                                                    <span className="goal-current-amount">{formatCurrency(goal.currentAmount)}</span>
                                                    <span className="goal-target-amount">of {formatCurrency(goal.targetAmount)}</span>
                                                </div>
                                                <div className="goal-progress-bar">
                                                    <div className="goal-progress-fill" style={{ width: `${Math.min(goal.progress.percentage, 100)}%` }} />
                                                </div>
                                                <div className="goal-progress-text">{goal.progress.percentage.toFixed(1)}% Complete</div>
                                            </div>

                                            <div className="goal-details">
                                                <div className="goal-detail">
                                                    <span className="goal-detail-label">Remaining</span>
                                                    <span className="goal-detail-value">{formatCurrency(goal.progress.remaining)}</span>
                                                </div>
                                                <div className="goal-detail">
                                                    <span className="goal-detail-label">Deadline</span>
                                                    <span className={`goal-detail-value ${goal.daysUntilDeadline !== null && goal.daysUntilDeadline < 30 ? 'urgent' : ''}`}>
                                                        {goal.daysUntilDeadline !== null ? `${goal.daysUntilDeadline} days` : formatDate(goal.deadline)}
                                                    </span>
                                                </div>
                                            </div>

                                            <Button variant="primary" className="contribute-button" onClick={() => setContributingGoal(goal)} icon="+">
                                                Add Contribution
                                            </Button>
                                        </Card>
                                    ))}
                                </div>
                            )}

                            {completedGoals.length > 0 && (
                                <>
                                    <h2 className="goals-section-title" style={{ marginTop: 'var(--spacing-2xl)' }}>Completed Goals</h2>
                                    <div className="goals-grid">
                                        {completedGoals.map((goal) => (
                                            <Card key={goal.id} className="goal-card completed">
                                                <div className="completed-badge">✓ Completed</div>
                                                <div className="goal-card-header">
                                                    <div className="goal-card-info">
                                                        <div className="goal-card-title">
                                                            <span className="goal-card-icon">{goal.icon}</span>
                                                            <span className="goal-card-name">{goal.name}</span>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDelete(goal.id)} icon="🗑️" />
                                                </div>
                                                <div className="goal-progress-section">
                                                    <div className="goal-amounts">
                                                        <span className="goal-current-amount">{formatCurrency(goal.currentAmount)}</span>
                                                    </div>
                                                    <div className="goal-progress-bar">
                                                        <div className="goal-progress-fill completed" style={{ width: '100%' }} />
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            <Modal isOpen={showAddModal} onClose={handleCloseModal} title={editingGoal ? 'Edit Goal' : 'Add New Goal'}>
                <GoalForm goal={editingGoal} onClose={handleCloseModal} onSuccess={handleCloseModal} />
            </Modal>

            {contributingGoal && (
                <Modal isOpen={!!contributingGoal} onClose={() => setContributingGoal(null)} title="Add Contribution">
                    <ContributeModal goal={contributingGoal} onClose={() => setContributingGoal(null)} onSuccess={() => setContributingGoal(null)} />
                </Modal>
            )}
        </div>
    );
};

export default Goals;
