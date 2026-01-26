import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const { completeOnboarding, user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [errors, setErrors] = useState({});

    const [formData, setFormData] = useState({
        // Step 1: Employee Info
        employeeId: '',
        department: '',
        designation: '',

        // Step 2: Bank Info
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',

        // Step 3: Debit Card
        debitCardNumber: '',
        debitCardExpiry: '',
        debitCardCVV: '',
        debitCardHolder: '',

        // Step 4: Credit Card
        creditCardNumber: '',
        creditCardExpiry: '',
        creditCardCVV: '',
        creditCardHolder: '',
        creditLimit: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = (step) => {
        const newErrors = {};

        if (step === 1) {
            if (!formData.employeeId.trim()) newErrors.employeeId = 'Employee ID is required';
            if (!formData.department.trim()) newErrors.department = 'Department is required';
            if (!formData.designation.trim()) newErrors.designation = 'Designation is required';
        } else if (step === 2) {
            if (!formData.bankName.trim()) newErrors.bankName = 'Bank name is required';
            if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
            if (!formData.ifscCode.trim()) newErrors.ifscCode = 'IFSC code is required';
            else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode.toUpperCase())) {
                newErrors.ifscCode = 'Invalid IFSC code format';
            }
            if (!formData.branchName.trim()) newErrors.branchName = 'Branch name is required';
        } else if (step === 3) {
            if (!formData.debitCardNumber.trim()) newErrors.debitCardNumber = 'Card number is required';
            else if (!/^\d{16}$/.test(formData.debitCardNumber.replace(/\s/g, ''))) {
                newErrors.debitCardNumber = 'Card number must be 16 digits';
            }
            if (!formData.debitCardExpiry.trim()) newErrors.debitCardExpiry = 'Expiry date is required';
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.debitCardExpiry)) {
                newErrors.debitCardExpiry = 'Format must be MM/YY';
            }
            if (!formData.debitCardCVV.trim()) newErrors.debitCardCVV = 'CVV is required';
            else if (!/^\d{3}$/.test(formData.debitCardCVV)) {
                newErrors.debitCardCVV = 'CVV must be 3 digits';
            }
            if (!formData.debitCardHolder.trim()) newErrors.debitCardHolder = 'Cardholder name is required';
        } else if (step === 4) {
            if (!formData.creditCardNumber.trim()) newErrors.creditCardNumber = 'Card number is required';
            else if (!/^\d{16}$/.test(formData.creditCardNumber.replace(/\s/g, ''))) {
                newErrors.creditCardNumber = 'Card number must be 16 digits';
            }
            if (!formData.creditCardExpiry.trim()) newErrors.creditCardExpiry = 'Expiry date is required';
            else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.creditCardExpiry)) {
                newErrors.creditCardExpiry = 'Format must be MM/YY';
            }
            if (!formData.creditCardCVV.trim()) newErrors.creditCardCVV = 'CVV is required';
            else if (!/^\d{3}$/.test(formData.creditCardCVV)) {
                newErrors.creditCardCVV = 'CVV must be 3 digits';
            }
            if (!formData.creditCardHolder.trim()) newErrors.creditCardHolder = 'Cardholder name is required';
            if (!formData.creditLimit.trim()) newErrors.creditLimit = 'Credit limit is required';
            else if (isNaN(formData.creditLimit) || Number(formData.creditLimit) <= 0) {
                newErrors.creditLimit = 'Credit limit must be a positive number';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateStep(4)) return;

        // Prepare onboarding data
        const onboardingData = {
            employeeId: formData.employeeId,
            department: formData.department,
            designation: formData.designation,
            bankInfo: {
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                ifscCode: formData.ifscCode.toUpperCase(),
                branchName: formData.branchName
            },
            debitCard: {
                lastFourDigits: formData.debitCardNumber.slice(-4),
                cardHolder: formData.debitCardHolder,
                expiry: formData.debitCardExpiry
            },
            creditCard: {
                lastFourDigits: formData.creditCardNumber.slice(-4),
                cardHolder: formData.creditCardHolder,
                expiry: formData.creditCardExpiry,
                creditLimit: Number(formData.creditLimit)
            },
            isOnboarded: true
        };

        await completeOnboarding(onboardingData);
        navigate('/dashboard');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="onboarding-step">
                        <div className="onboarding-step-header">
                            <h2>👤 Employee Information</h2>
                            <p>Let's start with your basic employment details</p>
                        </div>
                        <div className="onboarding-form">
                            <Input
                                label="Employee ID"
                                name="employeeId"
                                value={formData.employeeId}
                                onChange={handleChange}
                                error={errors.employeeId}
                                required
                                placeholder="Enter your employee ID"
                            />
                            <Input
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                error={errors.department}
                                required
                                placeholder="e.g., Engineering, Sales, HR"
                            />
                            <Input
                                label="Designation"
                                name="designation"
                                value={formData.designation}
                                onChange={handleChange}
                                error={errors.designation}
                                required
                                placeholder="e.g., Software Engineer, Manager"
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="onboarding-step">
                        <div className="onboarding-step-header">
                            <h2>🏦 Bank Information</h2>
                            <p>Add your bank account details for expense tracking</p>
                        </div>
                        <div className="onboarding-form">
                            <Input
                                label="Bank Name"
                                name="bankName"
                                value={formData.bankName}
                                onChange={handleChange}
                                error={errors.bankName}
                                required
                                placeholder="e.g., HDFC Bank, SBI, ICICI"
                            />
                            <Input
                                label="Account Number"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={handleChange}
                                error={errors.accountNumber}
                                required
                                placeholder="Enter your account number"
                            />
                            <Input
                                label="IFSC Code"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={handleChange}
                                error={errors.ifscCode}
                                required
                                placeholder="e.g., HDFC0001234"
                                maxLength={11}
                            />
                            <Input
                                label="Branch Name"
                                name="branchName"
                                value={formData.branchName}
                                onChange={handleChange}
                                error={errors.branchName}
                                required
                                placeholder="Enter branch name"
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="onboarding-step">
                        <div className="onboarding-step-header">
                            <h2>💳 Debit Card Information</h2>
                            <p>Add your debit card for expense tracking</p>
                        </div>
                        <div className="onboarding-form">
                            <Input
                                label="Card Number"
                                name="debitCardNumber"
                                type="text"
                                value={formData.debitCardNumber}
                                onChange={handleChange}
                                error={errors.debitCardNumber}
                                required
                                placeholder="1234 5678 9012 3456"
                                maxLength={16}
                            />
                            <div className="onboarding-form-row">
                                <Input
                                    label="Expiry Date"
                                    name="debitCardExpiry"
                                    value={formData.debitCardExpiry}
                                    onChange={handleChange}
                                    error={errors.debitCardExpiry}
                                    required
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
                                    required
                                    placeholder="123"
                                    maxLength={3}
                                />
                            </div>
                            <Input
                                label="Cardholder Name"
                                name="debitCardHolder"
                                value={formData.debitCardHolder}
                                onChange={handleChange}
                                error={errors.debitCardHolder}
                                required
                                placeholder="Name as on card"
                            />
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="onboarding-step">
                        <div className="onboarding-step-header">
                            <h2>💎 Credit Card Information</h2>
                            <p>Add your credit card details and limit</p>
                        </div>
                        <div className="onboarding-form">
                            <Input
                                label="Card Number"
                                name="creditCardNumber"
                                type="text"
                                value={formData.creditCardNumber}
                                onChange={handleChange}
                                error={errors.creditCardNumber}
                                required
                                placeholder="1234 5678 9012 3456"
                                maxLength={16}
                            />
                            <div className="onboarding-form-row">
                                <Input
                                    label="Expiry Date"
                                    name="creditCardExpiry"
                                    value={formData.creditCardExpiry}
                                    onChange={handleChange}
                                    error={errors.creditCardExpiry}
                                    required
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
                                    required
                                    placeholder="123"
                                    maxLength={3}
                                />
                            </div>
                            <Input
                                label="Cardholder Name"
                                name="creditCardHolder"
                                value={formData.creditCardHolder}
                                onChange={handleChange}
                                error={errors.creditCardHolder}
                                required
                                placeholder="Name as on card"
                            />
                            <Input
                                label="Credit Limit (₹)"
                                name="creditLimit"
                                type="number"
                                value={formData.creditLimit}
                                onChange={handleChange}
                                error={errors.creditLimit}
                                required
                                placeholder="e.g., 50000"
                            />
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="onboarding">
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <div className="onboarding-logo">
                        <span className="onboarding-logo-icon">💰</span>
                        <h1>Track Me</h1>
                    </div>
                    <p className="onboarding-welcome">Welcome, {user?.name}! 👋</p>
                    <p className="onboarding-subtitle">Let's set up your profile to get started</p>
                </div>

                <div className="onboarding-progress">
                    <div className="onboarding-progress-bar">
                        <div
                            className="onboarding-progress-fill"
                            style={{ width: `${(currentStep / 4) * 100}%` }}
                        />
                    </div>
                    <div className="onboarding-progress-text">
                        Step {currentStep} of 4
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {renderStep()}

                    <div className="onboarding-actions">
                        {currentStep > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handlePrevious}
                            >
                                Previous
                            </Button>
                        )}
                        <div className="onboarding-actions-spacer" />
                        {currentStep < 4 ? (
                            <Button
                                type="button"
                                variant="primary"
                                onClick={handleNext}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                Complete Setup
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
