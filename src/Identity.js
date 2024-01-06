import {React, useState, useEffect} from 'react';

function Identity({userGoals}) {
  const [identity, setIdentity] = useState('');

  useEffect(() => {
    setIdentity(userGoals.identity?userGoals.identity:'');
  }, [userGoals.identity]);

  return (
        <textarea
            className='identity'
            type="text"
            placeholder="Be descriptive (eg) A physically fit, calm person who helps others and can do the impossible..."
            value={identity}
            onChange={(e) => {setIdentity(e.target.value); userGoals.identity=e.target.value;}}
        />

  )
}

export default Identity;
