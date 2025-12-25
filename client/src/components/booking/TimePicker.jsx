// TimePicker Component
import { useState } from 'react';
import './TimePicker.css';

const TimePicker = ({ 
  selectedTime, 
  onTimeChange, 
  label = "Select Time",
  required = false,
  businessHours = { start: 8, end: 20 },
  timeSlotInterval = 30 // minutes
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const { start, end } = businessHours;
    
    for (let hour = start; hour <= end; hour++) {
      for (let minute = 0; minute < 60; minute += timeSlotInterval) {
        if (hour === end && minute > 0) break; // Don't go past end hour
        
        const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const displayTime = formatTime(hour, minute);
        slots.push({ value: timeString, display: displayTime });
      }
    }
    
    return slots;
  };

  // Format time for display (12-hour format)
  const formatTime = (hour, minute) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
  };

  // Format selected time for display
  const formatSelectedTime = () => {
    if (!selectedTime) return 'Select a time';
    const [hour, minute] = selectedTime.split(':').map(Number);
    return formatTime(hour, minute);
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="time-picker-container">
      <label className="time-picker-label">
        {label} {required && <span className="required">*</span>}
      </label>
      
      <div className="time-picker-input" onClick={() => setShowTimePicker(!showTimePicker)}>
        <span className={selectedTime ? 'selected' : 'placeholder'}>
          {formatSelectedTime()}
        </span>
        <span className="time-icon">🕐</span>
      </div>

      {showTimePicker && (
        <div className="time-dropdown">
          <div className="time-slots">
            {timeSlots.map((slot) => (
              <div
                key={slot.value}
                className={`time-slot ${selectedTime === slot.value ? 'selected' : ''}`}
                onClick={() => {
                  onTimeChange(slot.value);
                  setShowTimePicker(false);
                }}
              >
                {slot.display}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimePicker;