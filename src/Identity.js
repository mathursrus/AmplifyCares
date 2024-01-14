import {React, useState, useEffect} from 'react';

function Identity({userGoals}) {
  const [identity, setIdentity] = useState('');

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
        target="_blank" rel="noreferrer"
        href={`/self-care-coach?question=please help me define my ideal self`}>
          Need the Coach to help with describing your ideal self?
      </a>      
    </div>
  )
}

export default Identity;
