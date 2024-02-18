import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactTags } from 'react-tag-autocomplete';
import { generateGuid } from './utils/guidUtils';
import './GoalCategory.css';
const { useState, useEffect } = React;

function GoalCategory({ name, goals, updateGoals, wellKnownHabitsToAdopt, wellKnownHabitsToShed }) {
  const [rows, setRows] = useState(goals ? goals : []);
  const navigate = useNavigate();

  useEffect(() => {
    updateGoals(rows);
  }, [rows, updateGoals]);

  const addRow = () => {
    const newRow = { goal: '', id: generateGuid(), habitsToAdopt: [], habitsToShed: [] };
    setRows([...rows, newRow]);
  };

  const deleteRow = (index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this goal?');
    if (confirmDelete)  {
        let updatedRows = [];
        rows.forEach((row, i) => {
            if (i !== index) updatedRows = [...updatedRows, row];
        });
        setRows(updatedRows);
    }
  };

  const updateRow = (index, column, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [column]: value } : row
    );
    setRows(updatedRows);
  };

  return (
    <div className={`goal-category goal-category-${name.toLowerCase()}`}>
      <div className="goal-category-header">
        <b>{name} Care Goals</b>
        <a className="goal-help" 
          href="a" onClick={(e)=>{
          e.preventDefault(); // Prevent default anchor link behavior
          const newUrl = `?show-copilot=1&question=what ${name} care goals should i set to be my ideal self?&rand=${Math.random(1000)}`;
          navigate(newUrl);
        }}>        
          Need the Coach to help with {name} goal setting?
        </a>
      </div>
      <table>
        <thead>
          <tr>
            <th>Goal</th>
            <th>Habits to Adopt</th>
            <th>Habits to Shed</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  placeholder={`Enter ${name.toLowerCase()} care goal...`}
                  value={row.goal}
                  onChange={(e) => updateRow(index, 'goal', e.target.value)}
                />
              </td>
              <td>
                <ReactTags
                    selected={row.habitsToAdopt.map((name, index) => ({ value: name, label: name }))}
                    suggestions={wellKnownHabitsToAdopt.map((name, index) => ({ value: name, label: name }))}
                    onDelete={
                        (tagIndex) => {
                            const habits = rows[index].habitsToAdopt;
                            updateRow(index, 'habitsToAdopt', habits.filter((_, i) => i !== tagIndex));                                    
                        }}
                    onAdd={
                        (newTag) => {
                            const habits = rows[index].habitsToAdopt;
                            console.log("Adding ", newTag, " to habits ", habits);
                            updateRow(index, 'habitsToAdopt', [...habits, newTag.label]);            
                        }}
                    placeholderText="Select or add your own..."
                    allowNew="true"
                    labelText=''
                    collapseOnSelect="true"
                />                
              </td>
              <td className="habitsToShed">
                <ReactTags                    
                    selected={row.habitsToShed.map((name, index) => ({ value: name, label: name }))}
                    suggestions={wellKnownHabitsToShed.map((name, index) => ({ value: name, label: name }))}
                    onDelete={
                        (tagIndex) => {
                            const habits = rows[index].habitsToShed;
                            updateRow(index, 'habitsToShed', habits.filter((_, i) => i !== tagIndex));                                    
                        }}
                    onAdd={
                        (newTag) => {
                            const habits = rows[index].habitsToShed;
                            updateRow(index, 'habitsToShed', [...habits, newTag.label]);            
                        }}
                    placeholderText="Select or add your own..."
                    allowNew="true"
                    labelText=''
                    collapseOnSelect="true"
                />
              </td>
              <td>
                <FontAwesomeIcon
                    icon={faTrash}
                    className="delete-icon"
                    onClick={() => deleteRow(index)}
                />
                </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow}>+</button>
    </div>
  );
}

export default GoalCategory;
