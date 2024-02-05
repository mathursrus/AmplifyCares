
import { ReactTags } from 'react-tag-autocomplete';
import './HabitTracker.css';

const React = require('react');

const HabitTracker = ({ userGoals, habitsDone, suggestedHabits, habitSetter }) => {

    const [allTags, setAllTags] = React.useState([]);
    const [allSuggestions, setAllSuggestions] = React.useState([]);
    
    const populateTags = React.useCallback(() => {
        const tags = [];
        if (userGoals) {
            userGoals.forEach((goal, goalIndex) => {
                // Iterate through HabitsToAdopt
                if (goal.habitsToAdopt) {
                    goal.habitsToAdopt.forEach((habitToAdopt, index) => {
                    tags.push({
                        id: `${goalIndex}-adopt-${index}`,
                        type: 'adopt',
                        text: habitToAdopt,
                        value: habitToAdopt,
                        label: habitToAdopt,
                        selected: habitsDone && habitsDone.includes(habitToAdopt)                
                    });
                    });                    
                }
        
                // Iterate through HabitsToShed
                if (goal.habitsToShed) {
                    goal.habitsToShed.forEach((habitToShed, index) => {
                    tags.push({
                        id: `${goalIndex}-shed-${index}`,
                        type: 'shed',
                        text: habitToShed,
                        value: habitToShed,
                        label: habitToShed,
                        selected: habitsDone && habitsDone.includes(habitToShed)               
                    });
                    });                    
                }
            });
          }    
          
          if (habitsDone) {
            habitsDone.forEach((goal, goalIndex) => {
                if (!tags.find((tag) => tag.label === goal)) {
                    tags.push({
                        id: `${goalIndex}-done`,
                        type: 'custom',
                        text: goal,
                        value: goal,
                        label: goal,
                        selected: true
                    });
                }
            });
          };
          setAllTags(tags);     
          
          setAllSuggestions(suggestedHabits.filter((habit) => {
            // Check if the habit is present in any goal's habitsToAdopt or habitsToShed
            return !userGoals.some((goal) => {
              return (
                (goal.habitsToAdopt && goal.habitsToAdopt.includes(habit)) ||
                (goal.habitsToShed && goal.habitsToShed.includes(habit))
              );
            });
          }));

          console.log("All tags ", tags);
    }, [habitsDone, userGoals, suggestedHabits]);

    React.useEffect(() => {
        console.log("HabitTracker useEffect");
        populateTags();      
    }, [populateTags]);
    
    const handleTagClick = (tag) => {
        const updatedTags = allTags;
        const tagIndex = updatedTags.findIndex((t) => t.id === tag.id);
    
        console.log("Clicked on tag ", tag, " at index ", tagIndex);
        if (tag.type !== 'custom') {
            // toggle the selected state of the tag
            // updatedTags[tagIndex].selected = !updatedTags[tagIndex].selected;
            // setAllTags(updatedTags);
            if (!updatedTags[tagIndex].selected) {
                handleTagAddition(tag);                
            }
            else {
                handleTagDelete(tag);                
            }
        }
        else {
            handleTagDelete(tag);                            
        }
      };

      const handleTagAddition = (tag) => {
        //console.log("Added tag ", tag);
        habitSetter(((prev) => ({ ...prev, tags: [...habitsDone, tag.label] })));            
      }

      const handleTagDelete = (tag) => {
        //console.log("Deleted tag ", tag);
        habitSetter(((prev) => ({ ...prev, tags: (habitsDone.filter((t, i) => t !== tag.label))})));
      }

    function CustomTag({ classNames, tag, ...tagProps }) {
        //console.log("Custom tag ", classNames, tag);
        return (
          <button type="button" 
            className={`react-tags__tag ${tag.type === 'adopt' ? 'adopt' : (tag.type === 'shed' ? 'shed' : 'custom')} ${tag.selected ? 'selected' : ''}`} 
            {...tagProps} 
            title={tag.label}
            onClick={() => handleTagClick(tag)}>
                <span className={classNames.tagName}>{tag.label}</span>
          </button>
        )
      }

  return (
    //<div className='habit-tracker'>
        <ReactTags
            //tags={allTags}
            selected={allTags}
            suggestions={allSuggestions.map((name, index) => ({ label: name, value: name }))}
            onDelete={(tagIndex) => {
                    handleTagDelete(allTags[tagIndex]);                                    
                    }}
            onAdd={(newTag) => {
                    handleTagAddition(newTag);
                }}
            renderTag={CustomTag}
            placeholderText=""
            allowNew="true"
            labelText=''
            collapseOnSelect="true"                                
        /> 
    //</div>
  )
};

export default HabitTracker;
