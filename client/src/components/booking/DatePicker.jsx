// Date picker component
// Enhanced DatePicker Component with Calendar View
import { useState, useEffect } from 'react';
import './DatePicker.css';

const DatePicker = ({ 
  selectedDate, 
  onDateChange, 
  minDate = new Date(),
  maxDate = null,
  disabledDates = [],
  label = "Select Date",
  required = false 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Check if date is disabled
  const isDateDisabled = (date) => {
    const dateString = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is in the past
    if (date < today) return true;
    
    // Check if date is before minDate
    if (minDate && date < minDate) return true;
    
    // Check if date is after maxDate
    if (maxDate && date > maxDate) return true;
    
    // Check if date is in disabledDates array
    if (disabledDates.some(d => d.toISOString().split('T')[0] === dateString)) {
      return true;
    }
    
    return false;
  };

  // Check if date is selected
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    return date.toISOString().split('T')[0] === 
           new Date(selectedDate).toISOString().split('T')[0];
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toISOString().split('T')[0] === today.toISOString().split('T')[0];
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Previous month's days
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      days.push(date);
    }

    return days;
  };

  // Handle date selection
  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      onDateChange(date);
      setShowCalendar(false);
    }
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  // Format display date
  const formatDisplayDate = () => {
    if (!selectedDate) return 'Select a date';
    const date = new Date(selectedDate);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showCalendar && !e.target.closest('.date-picker-container')) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  const calendarDays = generateCalendarDays();

  return (
    <div className="date-picker-container">
      <label className="date-picker-label">
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className="date-picker-input" onClick={() => setShowCalendar(!showCalendar)}>
        <span className={selectedDate ? 'selected' : 'placeholder'}>
          {formatDisplayDate()}
        </span>
        <span className="calendar-icon">📅</span>
      </div>

      {showCalendar && (
        <div className="calendar-dropdown">
          <div className="calendar-header">
            <button 
              type="button"
              className="nav-btn" 
              onClick={() => navigateMonth(-1)}
            >
              ‹
            </button>
            <span className="current-month">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button 
              type="button"
              className="nav-btn" 
              onClick={() => navigateMonth(1)}
            >
              ›
            </button>
          </div>

          <div className="calendar-grid">
            {dayNames.map(day => (
              <div key={day} className="day-name">{day}</div>
            ))}
            
            {calendarDays.map((date, index) => (
              <div
                key={index}
                className={`calendar-day ${
                  !date ? 'empty' : ''
                } ${
                  date && isDateDisabled(date) ? 'disabled' : ''
                } ${
                  date && isDateSelected(date) ? 'selected' : ''
                } ${
                  date && isToday(date) ? 'today' : ''
                }`}
                onClick={() => date && handleDateClick(date)}
              >
                {date ? date.getDate() : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

