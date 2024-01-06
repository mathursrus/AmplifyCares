import React from 'react';

function HabitSelector() {
  // Add your logic to fetch and manage habits here
  return (
    <div className="habit-selector">
      <div className="habits-to-adopt">
        <b>Habits to Adopt</b>
        {/* Habit selection logic */}
      </div>
      <div className="habits-to-shed">
      <b>Habits to Shed</b>
        {/* Habit selection logic */}
      </div>
    </div>
  );
}

export default HabitSelector;
