import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import Button from './Button';
import Input from './Input';
import './ExpenseForm.css';

const ExpenseForm = ({ expense = null, onClose, onSuccess }) => {
  const { addExpense, editExpense, categories, addCategory } = useExpense();
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    categoryId: expense?.categoryId || '',
    date: expense?.date || new Date().toISOString().split('T')[0],
    description: expense?.description || '',
    paymentMode: expense?.paymentMode || 'UPI'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', icon: '📝', color: '#6366f1' });

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

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    if (!formData.paymentMode) {
      newErrors.paymentMode = 'Please select a payment mode';
    }

    return newErrors;
  };

  const handleAddCategory = () => {
    if (!newCategory.name) {
      alert('Please enter a category name');
      return;
    }

    const category = addCategory(newCategory);
    setFormData(prev => ({ ...prev, categoryId: category.id }));
    setShowNewCategory(false);
    setNewCategory({ name: '', icon: '📝', color: '#6366f1' });
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
      if (expense) {
        editExpense(expense.id, formData);
      } else {
        addExpense(formData);
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
      {errors.general && (
        <div className="form-error-banner">
          {errors.general}
        </div>
      )}

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
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <span className="input-error-message">{errors.categoryId}</span>}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowNewCategory(!showNewCategory)}
          className="add-category-btn"
        >
          {showNewCategory ? '− Cancel' : '+ Add New Category'}
        </Button>
      </div>

      {showNewCategory && (
        <div className="new-category-form">
          <div className="new-category-inputs">
            <Input
              label="Category Name"
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Groceries"
              size="sm"
            />
            <Input
              label="Icon"
              type="text"
              value={newCategory.icon}
              onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="📝"
              size="sm"
            />
            <Input
              label="Color"
              type="color"
              value={newCategory.color}
              onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
              size="sm"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleAddCategory}
            fullWidth
          >
            Create Category
          </Button>
        </div>
      )}

      <Input
        label="Date"
        type="date"
        name="date"
        value={formData.date}
        onChange={handleChange}
        error={errors.date}
        icon="📅"
        required
      />

      <div className="input-wrapper">
        <label className="input-label">
          Mode of Payment<span className="input-required">*</span>
        </label>
        <select
          name="paymentMode"
          value={formData.paymentMode}
          onChange={handleChange}
          className={`input-field ${errors.paymentMode ? 'input-error' : ''}`}
          required
        >
          <option value="UPI">UPI</option>
          <option value="Cash">Cash</option>
          <option value="Debit Card">Debit Card</option>
          <option value="Credit Card">Credit Card</option>
        </select>
        {errors.paymentMode && <span className="input-error-message">{errors.paymentMode}</span>}
      </div>

      <div className="input-wrapper">
        <label htmlFor="description" className="input-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Add a note (optional)"
          className="input-field"
          rows="3"
        />
      </div>

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
          {expense ? 'Update Expense' : 'Add Expense'}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
