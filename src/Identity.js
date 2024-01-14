import {React, useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

function Identity({userGoals}) {
  const [identity, setIdentity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setIdentity(userGoals.identity?userGoals.identity:'');
  }, [userGoals.identity]);

  return (
    <div className="goal-identity-header">
      <textarea
          className='identity'
          type="text"
          placeholder="Be descriptive (eg) A physically fit, calm person who helps others and can do the impossible..."
          value={identity}
          onChange={(e) => {setIdentity(e.target.value); userGoals.identity=e.target.value;}}
      />
      <a className="goal-help"
          href="a" onClick={(e)=>{
          e.preventDefault(); // Prevent default anchor link behavior
          const newUrl = `?show-copilot=1&question=please help me define my ideal self&rand=${Math.random(1000)}`;
          navigate(newUrl);
        }}>        
          Need the Coach to help with describing your ideal self?
      </a>      
    </div>
  )
}

export default Identity;
