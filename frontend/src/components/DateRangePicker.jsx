import React, { useState } from 'react';
import { useExpense } from '../context/ExpenseContext';
import Button from './Button';
import './DateRangePicker.css';

const DateRangePicker = () => {
    const { dateRange, setDateRange } = useExpense();
    const [showCustom, setShowCustom] = useState(false);
    const [customRange, setCustomRange] = useState({
        start: dateRange.start || '',
        end: dateRange.end || ''
    });

    const getPresetRange = (preset) => {
        const today = new Date();
        let start, end;

        switch (preset) {
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'lastMonth':
                start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                end = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'last30Days':
                start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                end = today;
                break;
            case 'last90Days':
                start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                end = today;
                break;
            default:
                return;
        }

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
        setShowCustom(false);
    };

    const handleCustomApply = () => {
        if (customRange.start && customRange.end) {
            setDateRange(customRange);
            setShowCustom(false);
        }
    };

    const handleClear = () => {
        setDateRange({ start: null, end: null });
        setCustomRange({ start: '', end: '' });
        setShowCustom(false);
    };

    const formatDateRange = () => {
        if (!dateRange.start || !dateRange.end) return 'All Time';

        const start = new Date(dateRange.start);
        const end = new Date(dateRange.end);

        return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
    };

    return (
        <div className="date-range-picker">
            <div className="date-range-display">
                <span className="date-range-icon">📅</span>
                <span className="date-range-text">{formatDateRange()}</span>
            </div>

            <div className="date-range-presets">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => getPresetRange('thisMonth')}
                >
                    This Month
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => getPresetRange('lastMonth')}
                >
                    Last Month
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => getPresetRange('last30Days')}
                >
                    Last 30 Days
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCustom(!showCustom)}
                >
                    Custom
                </Button>
                {(dateRange.start || dateRange.end) && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                    >
                        Clear
                    </Button>
                )}
            </div>

            {showCustom && (
                <div className="date-range-custom">
                    <div className="date-range-inputs">
                        <div className="input-wrapper">
                            <label className="input-label">Start Date</label>
                            <input
                                type="date"
                                value={customRange.start}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                                className="input-field"
                            />
                        </div>
                        <div className="input-wrapper">
                            <label className="input-label">End Date</label>
                            <input
                                type="date"
                                value={customRange.end}
                                onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                                className="input-field"
                                min={customRange.start}
                            />
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleCustomApply}
                        disabled={!customRange.start || !customRange.end}
                        fullWidth
                    >
                        Apply
                    </Button>
                </div>
            )}
        </div>
    );
};

export default DateRangePicker;
