import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RecommendationsPage.css';
import RecommendationTile from './RecommendationTile';
import { fetchAndInsertToken, getApiUrl, postWithToken } from './utils/urlUtil';



const RecommendationsPage = (props) => {
  const careType = props.type;
  const habit = props.habit;
  
  const [showInputFields, setShowInputFields] = useState(false);
  const [newRecommendation, setNewRecommendation] = useState({ title: '', type: careType, selfOrTogether: ''});
  const [recos, setRecos] = useState(null);

  // State to track the selected recommendation type (DIY or DIT)
  const [selfOrTogether, setSelfOrTogether] = useState(['DIY', 'DIT']);

  const navigate = useNavigate();

  const headlines = [
    [1, "Taking care of your mental health is essential for overall well-being and happiness. It empowers you to manage stress, build resilience, maintain healthy relationships, and unlock your full potential in both personal and professional aspects of life.", "Mental Care"],
    [2, "Prioritizing physical health is crucial for a fulfilling and vibrant life. It enables you to maintain energy levels, prevent illness and chronic conditions, improve cognitive function, enhance productivity, and enjoy a higher quality of life.", "Physical Care"],
    [3, "Nurturing spiritual health brings purpose, inner peace, and interconnectedness to your life. It cultivates resilience, joy, and a deeper understanding of life's purpose.", "Spiritual Care"],
    [4, "Investing in social health fosters meaningful connections and strengthens communities. By helping others, you will contribute to positive change, experience fulfillment, and create a ripple effect of kindness and compassion.", "Social Care"],
    [5, "A healthy mix of mental, physical, spiritual, social health gives you holistic self care.", "Select category ..."],
  ];

  useEffect(() => {
    async function fetchData() {
        const response = await fetchAndInsertToken(getApiUrl("/getrecommendations/?item="+careType+"&user="+localStorage.getItem('userName')));
        const data = await response.json();
        const recos = JSON.parse(data);
        setRecos(recos);
        console.log("Recos is ", recos);
    }
    fetchData();
  }, [props, careType]);
  
  const handleChange = (e) => {
    setNewRecommendation({ ...newRecommendation, [e.target.name]: e.target.value });
  };  
  
  const handleJoinRecommendation = async (e, recommendation) => {   
    e.preventDefault(); 
    recommendation.participants.push(localStorage.getItem('userName'));
  
    // Update the state with the modified recommendations
    setRecos([...filteredRecos]);
  
    // write to server 
    await writeRecommendationToServer(recommendation);
  };

  const handleLeaveRecommendation = async (e, recommendation) => {
    e.preventDefault();
    const userName = localStorage.getItem('userName');
    const participantIndex = recommendation.participants.indexOf(userName);

    if (participantIndex !== -1) {
      // Remove the user from the participants array
      recommendation.participants.splice(participantIndex, 1);

      // Update the state with the modified recommendations
      setRecos([...filteredRecos]);
  
      // write to server 
      await writeRecommendationToServer(recommendation);
    }
  };

  async function handleAddRecommendation(e)   {
    e.preventDefault();
    if (newRecommendation.title === '') {
      alert('A title is needed to create a recommendation');
      return;
    }
    if (newRecommendation.type < 0 || newRecommendation.type > 4) {
      alert('Select a category for your recommendation');
      return;
    }
    if (newRecommendation.selfOrTogether === '') {
      alert('Is this a DIY or DIT recommendation?');
      return;
    }    
    newRecommendation.contributor = localStorage.getItem('userName');
    newRecommendation.participants = [newRecommendation.contributor];
    recos.push(newRecommendation);
    const itemData = {
      title: newRecommendation.title,
      type: careType,
      selfOrTogether: newRecommendation.selfOrTogether,
      contributor: newRecommendation.contributor,
      participants: newRecommendation.participants
    }
      
    const result = await writeRecommendationToServer(itemData);

    setNewRecommendation({ title: '', type: careType, selfOrTogether: '' });    
    setShowInputFields(false);    
    console.log("Wrote ", itemData, " with result ", result);
    // take the user to the details page so they can add more info
    navigate(`/?showHabits=${itemData.type}&habit=${result}`);
  };

  async function handleDeleteRecommendation(itemData) {
    itemData.title='';
    itemData.contributor='';
    writeRecommendationToServer(itemData);
    navigate(`/?showHabits=${itemData.type}`);
  }

  async function writeRecommendationToServer(itemData) {
    const result = await postWithToken("/writerecommendation", itemData, localStorage.getItem('usertoken'));
    const recommendation = await result.json();
    console.log("Added recommendation ", recommendation);
    return recommendation;
    //await fetch(getApiUrl("/writerecommendation?item="+encodeURIComponent(JSON.stringify(itemData))));
  }

  const toggleSelfOrTogether = (type) => {
    if (selfOrTogether.includes(type)) {
      setSelfOrTogether(selfOrTogether.filter((item) => item !== type));
    } else {
      setSelfOrTogether([...selfOrTogether, type]);
    }
  };

  const filteredRecos = recos ? recos.filter((recommendation) => recommendation.selfOrTogether === undefined || selfOrTogether.includes(recommendation.selfOrTogether)) : [];
  const filteredHabit = recos ? recos.filter((recommendation) => recommendation._id === habit) : [];

  return (
    <div className="recommendations-page">
      <h5><i>{headlines.find(item => item[0] === careType)[1]}</i></h5>
      <br></br>

      {recos && filteredHabit.length>0? 
      (
        <div> 
          <RecommendationTile 
            recommendation={filteredHabit[0]} 
            handleJoinRecommendation={handleJoinRecommendation} 
            handleLeaveRecommendation={handleLeaveRecommendation} 
            showDetails={1} 
            onSave={writeRecommendationToServer}
            onDelete={handleDeleteRecommendation}
          />                    
          <Link className="back-to-recommendations" to={`/?showHabits=${careType}`}>Back to Recommendations</Link>
        </div>
      ) : (
      <div>
        <h6><center>Your colleagues have these habit recommendations. You can <li>DIY <i>(Do It Yourself - at your own time)</i> and/or </li><li>DIT <i>(Do It Together - join a circle with others)</i></li></center></h6>      
        {recos?
        (
          <div>
            <div className="filter-section">
              <label>
                <input
                  type="checkbox"
                  name="recommendationType"
                  value="DIY"
                  checked={selfOrTogether.includes('DIY')}
                  onChange={() => toggleSelfOrTogether('DIY')}
                />
                <img src="diy.jpg" alt="DIY" className="filter-icon" />
                DIY
              </label>
              <label>
                <input
                  type="checkbox"
                  name="recommendationType"
                  value="DIT"
                  checked={selfOrTogether.includes('DIT')}
                  onChange={() => toggleSelfOrTogether('DIT')}
                />
                <img src="dit.jpg" alt="DIT" className="filter-icon" />
                DIT
              </label>
            </div>

            <div className="emptydiv">

            {filteredRecos.length>0? (
              <div className="recommendation-container">
                {filteredRecos.map((recommendation, index) => (
                  <Link className="URL" to={`/?showHabits=${recommendation.type}&habit=${recommendation._id}`}>                                  
                    <RecommendationTile 
                      recommendation={recommendation} 
                      handleJoinRecommendation={handleJoinRecommendation} 
                      handleLeaveRecommendation={handleLeaveRecommendation} 
                      showDetails={0}/>
                  </Link>                                 
                ))}
              </div>
            ) : (<div><br></br>Whoops ... looks like we do not have any peer recommendations yet. Be the first one to add a recommendation below.</div>)
            }
            </div>
          </div>
        ) : (
          <p><center>Loading...</center></p>
        ) 
        }

        <div className="add-recommendation">
          {!showInputFields && (
              <button onClick={() => setShowInputFields(true)}>Care to help others?</button>
          )}

          {showInputFields && (
              <>
              <div className="radio-buttons">
                
                  <input
                    type="radio"
                    name="selfOrTogether"
                    value="DIY"
                    checked={newRecommendation.selfOrTogether === 'DIY'}
                    onChange={handleChange}
                  />
                  <div className="icon-container">
                    <img src="diy.jpg" alt="DIY" className="newreco-icon" />
                    <span className="tooltip">Is this a DIY recommendation?</span>
                  </div>
                
                
                  <input
                    type="radio"
                    name="selfOrTogether"
                    value="DIT"
                    checked={newRecommendation.selfOrTogether === 'DIT'}
                    onChange={handleChange}
                  />
                  <div className="icon-container">
                    <img src="dit.jpg" alt="DIT" className="newreco-icon" />
                    <span className="tooltip">Would you like others to join you and DIT?</span>
                  </div>              
                
              </div>
              <input
                  type="text"
                  name="title"
                  className="title-field"
                  placeholder="Enter Title"
                  value={newRecommendation.title}
                  onChange={handleChange}
              />
              <select
                  name="type"
                  className="type-field"
                  value={newRecommendation.type}
                  onChange={handleChange}
                >
                  {headlines.slice(0, 5).map(([type, description, label]) => (
                    <option key={type} value={type}>
                      {label}
                    </option>
                  ))}
                </select>
              <button className="save-button" onClick={handleAddRecommendation}>Save</button>
              <button className="cancel-button" onClick={() => setShowInputFields(false)}>Cancel</button>
              </>
          )}
        </div>
      </div>
      )}
  </div>
  );
};

export default RecommendationsPage;
