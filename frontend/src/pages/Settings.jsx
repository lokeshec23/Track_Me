import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import './Settings.css';

const Settings = () => {
    const { user, completeOnboarding } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        // Profile
        name: user?.name || '',
        email: user?.email || '',

        // Employee
        employeeId: user?.employeeId || '',
        department: user?.department || '',
        designation: user?.designation || '',

        // Bank
        bankName: user?.bankInfo?.bankName || '',
        accountNumber: user?.bankInfo?.accountNumber || '',
        ifscCode: user?.bankInfo?.ifscCode || '',
        branchName: user?.bankInfo?.branchName || '',

        // Debit Card
        debitCardNumber: '',
        debitCardExpiry: user?.debitCard?.expiry || '',
        debitCardCVV: '',
        debitCardHolder: user?.debitCard?.cardHolder || '',

        // Credit Card
        creditCardNumber: '',
        creditCardExpiry: user?.creditCard?.expiry || '',
        creditCardCVV: '',
        creditCardHolder: user?.creditCard?.cardHolder || '',
        creditLimit: user?.creditCard?.creditLimit || ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
        setSuccessMessage('');
    };

    const validateTab = (tab) => {
        const newErrors = {};

        if (tab === 'profile') {
            if (!formData.name.trim()) newErrors.name = 'Name is required';
            if (!formData.email.trim()) newErrors.email = 'Email is required';
        } else if (tab === 'employee') {
            if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
            if (!formData.department.trim()) newErrors.department = 'Department is required';
            if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
        } else if (tab === 'bank') {
            if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
            if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
            if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
            else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
                newErrors.ifscCode = 'Invalid IFSC code format';
            }
            if (!formData.branchName.trim()) newErrors.branchName = 'Branch name is required';
        } else if (tab === 'cards') {
            // Only validate if user is updating card info
            if (formData.debitCardNumber && !/^\d{16}$/.test(formData.debitCardNumber.replace(/\s/g, ''))) {
                newErrors.debitCardNumber = 'Card number must be 16 digits';
            }
            if (formData.debitCardExpiry && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.debitCardExpiry)) {
                newErrors.debitCardExpiry = 'Format must be MM/YY';
            }
            if (formData.debitCardCVV && !/^\d{3}$/.test(formData.debitCardCVV)) {
                newErrors.debitCardCVV = 'CVV must be 3 digits';
            }

            if (formData.creditCardNumber && !/^\d{16}$/.test(formData.creditCardNumber.replace(/\s/g, ''))) {
                newErrors.creditCardNumber = 'Card number must be 16 digits';
            }
            if (formData.creditCardExpiry && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.creditCardExpiry)) {
                newErrors.creditCardExpiry = 'Format must be MM/YY';
            }
            if (formData.creditCardCVV && !/^\d{3}$/.test(formData.creditCardCVV)) {
                newErrors.creditCardCVV = 'CVV must be 3 digits';
            }
            if (formData.creditLimit && (isNaN(formData.creditLimit) || Number(formData.creditLimit) <= 0)) {
                newErrors.creditLimit = 'Credit limit must be a positive number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateTab(activeTab)) return;

        const updateData = {
            isOnboarded: true
        };

        if (activeTab === 'profile') {
            updateData.name = formData.name;
            updateData.email = formData.email;
        } else if (activeTab === 'employee') {
            updateData.employeeId = formData.employeeId;
            updateData.department = formData.department;
            updateData.designation = formData.designation;
        } else if (activeTab === 'bank') {
            updateData.bankInfo = {
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode.toUpperCase(),
                branchName: formData.branchName
            };
        } else if (activeTab === 'cards') {
            if (formData.debitCardNumber) {
                updateData.debitCard = {
                    lastFourDigits: formData.debitCardNumber.slice(-4),
                    cardHolder: formData.debitCardHolder,
                    expiry: formData.debitCardExpiry
                };
            }
            if (formData.creditCardNumber) {
                updateData.creditCard = {
                    lastFourDigits: formData.creditCardNumber.slice(-4),
                    cardHolder: formData.creditCardHolder,
                    expiry: formData.creditCardExpiry,
                    creditLimit: Number(formData.creditLimit)
                };
            }
        }

        await completeOnboarding(updateData);
        setIsEditing(false);
        setSuccessMessage('Settings updated successfully!');

        // Clear sensitive fields
        setFormData(prev => ({
            ...prev,
            debitCardNumber: '',
            debitCardCVV: '',
            creditCardNumber: '',
            creditCardCVV: ''
        }));
    };

    const handleCancel = () => {
        setIsEditing(false);
        setErrors({});
        setSuccessMessage('');
        // Reset form data
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            employeeId: user?.employeeId || '',
            department: user?.department || '',
            designation: user?.designation || '',
            bankName: user?.bankInfo?.bankName || '',
            accountNumber: user?.bankInfo?.accountNumber || '',
            ifscCode: user?.bankInfo?.ifscCode || '',
            branchName: user?.bankInfo?.branchName || '',
            debitCardNumber: '',
            debitCardExpiry: user?.debitCard?.expiry || '',
            debitCardCVV: '',
            debitCardHolder: user?.debitCard?.cardHolder || '',
            creditCardNumber: '',
            creditCardExpiry: user?.creditCard?.expiry || '',
            creditCardCVV: '',
            creditCardHolder: user?.creditCard?.cardHolder || '',
            creditLimit: user?.creditCard?.creditLimit || ''
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="settings-section">
                        <h3>👤 Profile Information</h3>
                        <div className="settings-form">
                            <Input
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                error={errors.name}
                                disabled={!isEditing}
                                required
                            />
                            <Input
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                disabled={!isEditing}
                                required
                            />
                        </div>
                    </div>
                );

            case 'employee':
                return (
                    <div className="settings-section">
                        <h3>💼 Employee Information</h3>
                        <div className="settings-form">
                            <Input
                                label="Employee ID"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                error={errors.employeeId}
                                disabled={!isEditing}
                                required
                            />
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                error={errors.department}
                                disabled={!isEditing}
                                required
                            />
                            <Input
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                error={errors.designation}
                                disabled={!isEditing}
                                required
                            />
                        </div>
                    </div>
                );

            case 'bank':
                return (
                    <div className="settings-section">
                        <h3>🏦 Bank Information</h3>
                        <div className="settings-form">
                            <Input
                                label="Bank Name"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                error={errors.bankName}
                                disabled={!isEditing}
                                required
                            />
                            <Input
                                label="Account Number"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                error={errors.accountNumber}
                                disabled={!isEditing}
                                required
                            />
                            <Input
                                label="IFSC Code"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleChange}
                                error={errors.ifscCode}
                                disabled={!isEditing}
                                required
                                maxLength={11}
                            />
                            <Input
                                label="Branch Name"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleChange}
                                error={errors.branchName}
                                disabled={!isEditing}
                                required
                            />
                        </div>
                    </div>
                );

            case 'cards':
                return (
                    <div className="settings-section">
                        <h3>💳 Payment Cards</h3>

                        <div className="settings-card-section">
                            <h4>Debit Card</h4>
                            {user?.debitCard && !isEditing && (
                                <p className="settings-card-info">
                                    Card ending in ****{user.debitCard.lastFourDigits}
                                </p>
                            )}
                            <div className="settings-form">
                                <Input
                                    label="Card Number"
                                    name="debitCardNumber"
                                    value={formData.debitCardNumber}
                                    onChange={handleChange}
                                    error={errors.debitCardNumber}
                                    disabled={!isEditing}
                                    placeholder={isEditing ? "Enter new card number" : ""}
                                    maxLength={16}
                                />
                                <div className="settings-form-row">
                                    <Input
                                        label="Expiry Date"
                                        name="debitCardExpiry"
                                        value={formData.debitCardExpiry}
                                        onChange={handleChange}
                                        error={errors.debitCardExpiry}
                                        disabled={!isEditing}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                    />
                                    <Input
                                        label="CVV"
                                        name="debitCardCVV"
                                        type="password"
                                        value={formData.debitCardCVV}
                                        onChange={handleChange}
                                        error={errors.debitCardCVV}
                                        disabled={!isEditing}
                                        placeholder={isEditing ? "123" : ""}
                                        maxLength={3}
                                    />
                                </div>
                                <Input
                                    label="Cardholder Name"
                                    name="debitCardHolder"
                                    value={formData.debitCardHolder}
                                    onChange={handleChange}
                                    error={errors.debitCardHolder}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="settings-card-section">
                            <h4>Credit Card</h4>
                            {user?.creditCard && !isEditing && (
                                <p className="settings-card-info">
                                    Card ending in ****{user.creditCard.lastFourDigits} | Limit: ₹{user.creditCard.creditLimit?.toLocaleString()}
                                </p>
                            )}
                            <div className="settings-form">
                                <Input
                                    label="Card Number"
                                    name="creditCardNumber"
                                    value={formData.creditCardNumber}
                                    onChange={handleChange}
                                    error={errors.creditCardNumber}
                                    disabled={!isEditing}
                                    placeholder={isEditing ? "Enter new card number" : ""}
                                    maxLength={16}
                                />
                                <div className="settings-form-row">
                                    <Input
                                        label="Expiry Date"
                                        name="creditCardExpiry"
                                        value={formData.creditCardExpiry}
                                        onChange={handleChange}
                                        error={errors.creditCardExpiry}
                                        disabled={!isEditing}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                    />
                                    <Input
                                        label="CVV"
                                        name="creditCardCVV"
                                        type="password"
                                        value={formData.creditCardCVV}
                                        onChange={handleChange}
                                        error={errors.creditCardCVV}
                                        disabled={!isEditing}
                                        placeholder={isEditing ? "123" : ""}
                                        maxLength={3}
                                    />
                                </div>
                                <Input
                                    label="Cardholder Name"
                                    name="creditCardHolder"
                                    value={formData.creditCardHolder}
                                    onChange={handleChange}
                                    error={errors.creditCardHolder}
                                    disabled={!isEditing}
                                />
                                <Input
                                    label="Credit Limit (₹)"
                                    name="creditLimit"
                                    type="number"
                                    value={formData.creditLimit}
                                    onChange={handleChange}
                                    error={errors.creditLimit}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="settings">
            <div className="settings-container">
                <div className="settings-header">
                    <h1>⚙️ Settings</h1>
                    <p>Manage your account and preferences</p>
                </div>

                {successMessage && (
                    <div className="settings-success">
                        ✓ {successMessage}
                    </div>
                )}

                <div className="settings-tabs">
                    <button
                        className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'employee' ? 'active' : ''}`}
                        onClick={() => setActiveTab('employee')}
                    >
                        Employee
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'bank' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bank')}
                    >
                        Bank
                    </button>
                    <button
                        className={`settings-tab ${activeTab === 'cards' ? 'active' : ''}`}
                        onClick={() => setActiveTab('cards')}
                    >
                        Cards
                    </button>
                </div>

                <div className="settings-content">
                    {renderTabContent()}
                </div>

                <div className="settings-actions">
                    {!isEditing ? (
                        <Button
                            variant="primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </Button>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleSave}
                            >
                                Save Changes
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
