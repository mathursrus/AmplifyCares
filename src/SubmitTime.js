import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Confetti from "react-confetti";
import RecommendationsPage from './RecommendationsPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTimes, faEdit, faTrash, faCheck } from '@fortawesome/free-solid-svg-icons';
import { fetchAndInsertToken, fetchWithToken, getApiHost, getApiUrl } from './utils/urlUtil';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './SubmitTime.css';
import UserBadges from './UserBadges';
//import SpeechRecognition from './SpeechToText';
import SelfCareCircles from './SelfCareCircles';
import TimerInputField from './TimerInputField';
import { addHabitToDay, getHabitsData, getUserMode, refreshUserInfo, removeHabitFromDay } from './utils/userUtil';
import { getGoalSettingStep, getUserGoals, isGoalCategory } from './utils/goalsUtil';
import HabitTracker from './HabitTracker';
import UserMode from './UserMode';
    

const React = require('react');
const { useState, useEffect, useCallback } = React;

const placeholderStrings = {
    MentalHealth: 'Minutes on mental health.',
    PhysicalHealth: 'Minutes on physical health.',
    SpiritualHealth: 'Minutes on spirtual health.',
    SocialHealth: 'Minutes on social health.'
};

const wellKnownTags = {
    MentalHealth: ['meditation', 'learning', 'chanting', 'deep breathing', 'journaling', 'reading'/* Add more tags here */],
    PhysicalHealth: ['exercise', 'sports', 'doctor visit', 'yoga', 'dog walking' /* Add more tags here */],
    SpiritualHealth: ['prayers', 'religious activities', /* Add more tags here */],
    SocialHealth: ['volunteering', 'team lunch', 'mentoring', 'family time', 'friends time' /* Add more tags here */],
};

const SubmitTimePage = () => {
    const [mode, setMode] = useState(getUserMode()); 

    const [habitsData, setHabitsData] = useState([]);
    const [goalsData, setGoalsData] = useState(null);
  
    const [MentalHealth, setMentalHealth] = useState({ time: '', tags: [] });
    const [PhysicalHealth, setPhysicalHealth] = useState({ time: '', tags: [] });
    const [SpiritualHealth, setSpiritualHealth] = useState({ time: '', tags: [] });
    const [SocialHealth, setSocialHealth] = useState({ time: '', tags: [] });
    // Create a state variable to store the selected animation
    const [animation, setAnimation] = React.useState(null);
    //const clapSounds = [new Audio('/claps.wav'), new Audio('/yourock.mp3'), new Audio('/musicclip.mp3'), new Audio('/crowd.mp3')];
    const navigate = useNavigate();
    const location = useLocation();
        
    const [flyoutState, setFlyoutState] = useState(0);
    const [habit, setHabit] = useState('');

    const [selectedDate, setSelectedDate] = useState(new Date());
    // for edit mode
    const [pastEntries, setPastEntries] = useState([]);
    const [editingEntry, setEditingEntry] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false); 
            
    const [selfCareCircles, setSelfCareCircles] = useState(null);
    const [userGoals, setUserGoals] = useState([]);

    //const niceWorkAudio = new Audio('/GoodJob.mp3');
    //const sorryAudio = new Audio('/Error.mp3');

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const showHabits = searchParams.get('showHabits');
        const habit = searchParams.get('habit');    
        setFlyoutState(showHabits ? mapParamToFlyoutState(showHabits) : 0);
        setHabit(habit);
        refreshUserCirclesAndGoals();
        //console.log("Show habits is ", showHabits, ", habit is ", habit, ", flyout state is ", flyoutState);              
    }, [location.search]);

    function mapParamToFlyoutState(param) {
        const temp = parseInt(param);
        console.log("Mapping param ", param, " to ", temp);
        if (isNaN(temp)) {
            switch (param) {
                case 'mental':
                    return 1;
                case 'physical':
                    return 2;
                case 'spiritual':
                    return 3;
                case 'social':
                    return 4;
                default:
                    return 0;
            }
        }
        else {
            return temp;
        }
    }

    const clearFields = useCallback(() => {
        setMentalHealth({time: '', tags: []});
        setPhysicalHealth({time: '', tags: []});
        setSpiritualHealth({time: '', tags: []});
        setSocialHealth({time: '', tags: []});
        setEditingEntry(null);
        setIsEditMode(false);            
    }, []);

    const handleEditClick = useCallback(async (entry) => {
        // Set the entry to be edited in the state and enter edit mode
        await clearFields();
        setEditingEntry(entry);
        console.log("Editing entry ", entry);
        // Map the tags in the entry to include the 'value' property based on 'wellKnownTags'
        const mentalHealthTags = (entry.mental_health_activity);
        const physicalHealthTags = (entry.physical_health_activity);
        const spiritualHealthTags = (entry.spiritual_health_activity);
        const socialHealthTags = (entry.societal_health_activity);
        
        setMentalHealth({
            time: entry.mental_health_time?""+entry.mental_health_time:"",
            tags: mentalHealthTags,
        });
        setPhysicalHealth({
            time: entry.physical_health_time?""+entry.physical_health_time:"",
            tags: physicalHealthTags,
        });
        setSpiritualHealth({
            time: entry.spiritual_health_time?""+entry.spiritual_health_time:"",
            tags: spiritualHealthTags,
        });
        setSocialHealth({
            time: entry.societal_health_time?""+entry.societal_health_time:"",
            tags: socialHealthTags,
        });
        setIsEditMode(true);
    }, [clearFields]);

    const fetchEntries = useCallback(async (date) => {
        try {
            if (mode === "Performance") {
                const formattedDate = date.toLocaleDateString();
                // Make a server request to get entries for the selected date
                const response = await fetchAndInsertToken(getApiUrl(`/getselfcaredata/?item=${localStorage.getItem('userName')}&date=${formattedDate}`));
                if (response.ok) {
                    const data = await response.json();
                    const entries = JSON.parse(data);
                    setPastEntries(entries);                    
                }
            } else {
                const startDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 6);
                // Make a server request to get habits data for the selected date
                const habitsData = await getHabitsData(startDay, date, 'total');
                const goalsData = await getUserGoals();
                setHabitsData(habitsData);
                setGoalsData(goalsData);                
            }
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    }, [mode]);

    useEffect(() => {
        clearFields();  
        fetchEntries(selectedDate);          
    }, [clearFields, fetchEntries, selectedDate]);
    
    useEffect(() => {
        if (pastEntries.length === 1) {
            handleEditClick(pastEntries[0]);
        }
    }, [pastEntries, handleEditClick]);

    // Create a function to generate a random number between 1 and 4
    const getRandomNumber = () => {
        return Math.floor(Math.random() * 4) + 1;
    };

    const getSubmissionTime = () => {            
        const date = selectedDate.toLocaleDateString();
        console.log(date);
        return date;
    }        

    /*
    const showData = async (results) => {
        console.log("Submit time got results ", results);  
        if (results.length > 0 && results[0] !== null) {
            const dateString = results[0].DateTime;
            const year = parseInt(dateString.substring(0, 4));
            const month = parseInt(dateString.substring(5, 7)) - 1; // Months are zero-based
            const day = parseInt(dateString.substring(8, 10));
            const returnedDate = new Date(year, month, day);                            
            // play sound clip celebrating
            niceWorkAudio.play();
            celebrate(returnedDate);
        }
        else {
            // play sound clip saying error happened
            sorryAudio.play();
        }
    } */       

    const writeSelfCareEntry = async (itemData) => {
        console.log("Write Self Care Entry called with ", itemData);
        const result = await fetchWithToken(getApiHost()+"/writeselfcarewithtoken/?item="+JSON.stringify(itemData), localStorage.getItem('usertoken'));                  
        return result;
    }
    
    const handleSubmit = async(e) => {    
        // Submit form data
        const itemData = {
            name: localStorage.getItem('userName'),
            DateTime: getSubmissionTime(),
            lastEdited: new Date(),
        };
        //if (MentalHealth.time !== '') {
            itemData.mental_health_time = parseInt(MentalHealth.time);
            itemData.mental_health_activity = MentalHealth.tags;
        //}
        //if (PhysicalHealth.time !== '') {
            itemData.physical_health_time = parseInt(PhysicalHealth.time);
            itemData.physical_health_activity = PhysicalHealth.tags;
        //}
        //if (SpiritualHealth.time !== '') {
            itemData.spiritual_health_time = parseInt(SpiritualHealth.time);
            itemData.spiritual_health_activity = SpiritualHealth.tags;
        //}
        //if (SocialHealth.time !== '') {
            itemData.societal_health_time = parseInt(SocialHealth.time);
            itemData.societal_health_activity = SocialHealth.tags;
        //}
        if (isEditMode) {
            itemData._id = editingEntry._id;
            itemData.DateTime = editingEntry.DateTime;                
        }
        console.log(itemData);
        writeSelfCareItem(itemData);            
    };

    const writeSelfCareItem = async (itemData) => {
        const response = await writeSelfCareEntry(itemData);  
        if (!response.ok) {
            console.log("Ugh");
        }
        else {         
            const utcDate = new Date(
                parseInt(itemData.DateTime.slice(0, 4)),   // Year
                parseInt(itemData.DateTime.slice(5, 7)) - 1, // Month (0-based)
                parseInt(itemData.DateTime.slice(8, 10)),  // Day                    
                );       
            celebrate(utcDate);                
            fetchEntries(selectedDate);
        }
        return response;
    };

    const celebrate = async (date) => {                                
        console.log("Celebrating after setting selected date to ", date);
        setSelectedDate(date);
        
        // Set the state variable to the random number
        const rand = getRandomNumber();
        // console.log("Animation set to ", rand);
        setAnimation(rand);
        
        setTimeout(() => {
            setAnimation(null);
            navigate('/summary-page');
        }, 6000);
    }
    
    const handleDeleteClick = async (entry) => {
        const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
        if (confirmDelete) {
            entry.mental_health_time = 0;
            entry.physical_health_time = 0;
            entry.spiritual_health_time = 0;
            entry.societal_health_time = 0;
            entry.mental_health_activity = [];
            entry.physical_health_activity = [];
            entry.spiritual_health_activity = [];
            entry.societal_health_activity = [];
            const response = await writeSelfCareEntry(entry);
            if (response.ok) {
                console.log("Successful delete");
                clearFields();
                fetchEntries(selectedDate);
            }
            else {
                console.log("Something failed ", response.body);
            }
        }
    }
    
    const toggleHabitState = (habit, date, category, type) => {
        console.log("Toggling habit ", habit, " for date ", date);
        // Get the habits data for the selected date
        const habits = habitsData.find((data) => data.date === date);
        // If the habit is already set, remove it
        if (habits[habit]) {
            habits[habit] = false;
            removeHabitFromDay(date, habit, category);
        } else {
            habits[habit] = true;
            addHabitToDay(date, habit, category);            
        }
        // Update the habits data
        setHabitsData((prev) => {
            return prev.map((data) => {
                if (data.date === date) {
                    return habits;
                }
                return data;
            });
        });
    }

    const mentalHealthRecommendations = (e) => {
        e.preventDefault();
        setFlyoutState(1);
        console.log("Clicked mental reco");        
    }

    const physicalHealthRecommendations = (e) => {
        e.preventDefault();
        setFlyoutState(2);
        console.log("Clicked physical reco");        
    }

    const spiritualHealthRecommendations = (e) => {
        e.preventDefault();
        setFlyoutState(3);
        console.log("Clicked spriritual reco");        
    }

    const socialHealthRecommendations = (e) => {
        e.preventDefault();
        setFlyoutState(4);
        console.log("Clicked social reco");
    }

    const handleCloseFlyout = () => {
        setHabit('');
        setFlyoutState(0);
        refreshUserCirclesAndGoals();
        console.log("Clicked close");        
    } 
    
    const refreshUserCirclesAndGoals = async () => {
        const result = await refreshUserInfo();
        //console.log("Got user info ", result);
        setSelfCareCircles(result.circles);
        
        const userGoals = await getUserGoals();
        setUserGoals(userGoals && userGoals.goals ? userGoals.goals : []);              
    }               
        
    const isValidFlyoutState = () => {
        return (flyoutState >0 && flyoutState <6);
    }

    useEffect(() => {
        //console.log("Flyout state is ", flyoutState); 
    }, [flyoutState]); // Run the effect only when flyoutState changes

    return (
        <Container className="submit-time-container">    
            <UserBadges badges={JSON.parse(localStorage.getItem('badges'))} />                
            <form className='time-entry-form'>
                <div className="side-by-side">
                    {/*
                    <div className="talk-to-enter">                            
                            <h3>Talk to Amplify Cares</h3>
                            Simply click the mic and tell Amplify cares when and how you took care of yourself. 
                            Click the mic again when done and your self care data will be saved. It works like magic. 
                            (eg) Yesterday, I ran for 2 hours                            
                        <SpeechRecognition endpoint={"gettimeinput"} onResults={showData} onHover={"Talk to Amplify Cares (eg) Yesterday, I ran for 2 hours"}/>                                    
                    </div>
                    */}   
                    {selfCareCircles && (
                        <SelfCareCircles
                            circles={selfCareCircles}
                            onCheckIn={writeSelfCareItem}
                        />                               
                    )}
                </div>

                <center>
                    <span className='non-bold'>Select self-care date</span>
                    <br></br>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date) => {console.log("Selected date ", date); setSelectedDate(date)}}
                        dateFormat="MM/dd/yyyy"
                        className="date-picker"
                    />
                    <br></br>
                    <br></br>
                </center> 

                <UserMode setMode={setMode} />       
       
                <center>
                {mode === "Performance" ? ( 
                    <div>
                    <h2 className="subheader">Performance Mode - The more conscious time you spend on self care, the better.</h2>                                                       
                    {pastEntries.length > 1 && 
                    <div style={{ fontSize: 'smaller' }}>
                        <center>
                            Existing entries
                            <table className="entry-table">
                                <thead>
                                    <tr>
                                        <th className="non-bold">Mental Care</th>
                                        <th className="non-bold">Physical Care</th>
                                        <th className="non-bold">Spiritual Care</th>
                                        <th className="non-bold">Social Care</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pastEntries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td><center>{entry.mental_health_time}</center></td>
                                            <td><center>{entry.physical_health_time}</center></td>
                                            <td><center>{entry.spiritual_health_time}</center></td>
                                            <td><center>{entry.societal_health_time}</center></td>
                                            <td>
                                                <FontAwesomeIcon
                                                    icon={faEdit}
                                                    className="edit-icon"
                                                    onClick={() => handleEditClick(entry)}
                                                />
                                                <span className="icon-space"></span>
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className="delete-icon"
                                                    onClick={() => handleDeleteClick(entry)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </center>
                    </div>  
                    }                    
                    <div className='row'>
                        <label className='formLabel'>
                            <span className='bold'>Mental Care</span>                    
                            <a href="a" onClick={mentalHealthRecommendations}>
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                            </a>                        
                        </label>
                        <div className="input-container">
                            <div className="time-input-container">                            
                            <TimerInputField 
                                value={MentalHealth.time}
                                placeholder={placeholderStrings.MentalHealth}
                                setValue={(time) => {
                                    setMentalHealth((prev) => ({ ...prev, time }))
                                }}/>
                            </div>
                            
                            <HabitTracker 
                                userGoals={userGoals.Mental}
                                habitsDone={MentalHealth.tags}
                                suggestedHabits={wellKnownTags.MentalHealth}
                                habitSetter={setMentalHealth}
                            />                     
                        </div>
                    </div>
                    <br></br>
                    <div className='row'>
                        <label className='formLabel'>
                            <span className='bold'>Physical Care</span>
                            <a href="a" onClick={physicalHealthRecommendations}>
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                            </a>
                        </label>
                        <div className="input-container">
                            <div className="time-input-container">                            
                                <TimerInputField 
                                    value={PhysicalHealth.time}
                                    placeholder={placeholderStrings.PhysicalHealth}
                                    setValue={(time) => {
                                        setPhysicalHealth((prev) => ({ ...prev, time }))
                                }}/>
                            </div>                            
                            <HabitTracker 
                                userGoals={userGoals.Physical}
                                habitsDone={PhysicalHealth.tags}
                                suggestedHabits={wellKnownTags.PhysicalHealth}
                                habitSetter={setPhysicalHealth}
                            />                    
                        </div>
                    </div>
                    <br></br>
                    <div className='row'>
                        <label className='formLabel'>
                            <span className='bold'>Spiritual Care</span>
                            <a href="a" onClick={spiritualHealthRecommendations}>
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                            </a>
                        </label>
                        <div className="input-container">
                            <div className="time-input-container">                    
                                <TimerInputField 
                                    value={SpiritualHealth.time}
                                    placeholder={placeholderStrings.SpiritualHealth}
                                    setValue={(time) => {
                                        setSpiritualHealth((prev) => ({ ...prev, time }))
                                    }}/>
                            </div>
                            <HabitTracker 
                                userGoals={userGoals.Spiritual}
                                habitsDone={SpiritualHealth.tags}
                                suggestedHabits={wellKnownTags.SpiritualHealth}
                                habitSetter={setSpiritualHealth}
                            />                  
                        </div>
                    </div>
                    <br></br>
                    <div className='row'>
                        <label className='formLabel'>
                            <span className='bold'>Social Care</span>
                            <a href="http://a.b" onClick={socialHealthRecommendations}>
                                <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                            </a>
                        </label>
                        <div className="input-container">
                            <div className="time-input-container">                    
                                <TimerInputField 
                                    value={SocialHealth.time}
                                    placeholder={placeholderStrings.SocialHealth}
                                    setValue={(time) => {
                                        setSocialHealth((prev) => ({ ...prev, time }))
                                    }}/>
                            </div>
                            <HabitTracker 
                                userGoals={userGoals.Social}
                                habitsDone={SocialHealth.tags}
                                suggestedHabits={wellKnownTags.SocialHealth}
                                habitSetter={setSocialHealth}
                            />                   
                        </div>                        
                        <div>
                            <center>
                                <Button className="submit-time" onClick={handleSubmit}><b>{isEditMode ? 'Update ' : 'Submit '}Your Self-Care Time</b></Button>
                            </center>                                   
                        </div>
                    </div>
                </div>
                ) : (
                <div>
                    <h2 className="subheader">Self Improvement Mode - It doesn't matter how long you spend, as long as you are consistent.</h2>
                    {!(goalsData && habitsData) ? (
                        <center><p>Loading...</p></center>
                    ) : (
                    <div className='editable-habit-table-container'>
                    {goalsData.goals && 
                        (getGoalSettingStep(goalsData) > 2) ? (
                        <table className="editable-habit-table">
                        <thead>
                            <tr>
                            <th>Habit</th>
                            {habitsData.map((data) => (
                                <th key={data.date}>{data.date.slice(8, 10)}</th>
                            ))}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(goalsData.goals).map(([category, goals]) => {
                            if (!isGoalCategory(category))  {
                                return [];
                            }
                            return goals.flatMap((goal, goalIndex) => {
                                const habitsToAdoptRows = goal.habitsToAdopt?.map((habitToAdopt, index) => (
                                <tr key={habitToAdopt}>
                                    <td className="adopt">(+){habitToAdopt}</td>
                                    {habitsData.map((data) => (
                                    <td
                                        key={data.date}
                                        //className={data[habitToAdopt] ? 'green-cell active' : 'red-cell'}
                                        onClick={() => toggleHabitState(habitToAdopt, data.date, category, "adopt")}
                                        title={data[habitToAdopt] ? '👏 You did it!' : 'Did you do it?'}
                                    >
                                        {data[habitToAdopt] ? (
                                        <FontAwesomeIcon icon={faCheck} className="green" />
                                        ) : (
                                        <FontAwesomeIcon icon={faTimes} className="no-show" />
                                        )}
                                    </td>
                                    ))}
                                </tr>
                                ));

                                const habitsToShedRows = goal.habitsToShed?.map((habitToShed, index) => (
                                    <tr key={habitToShed}>
                                        <td className="shed">(-){habitToShed}</td>
                                        {habitsData.map((data) => (
                                        <td
                                            key={data.date}
                                            //className={data[habitToAdopt] ? 'green-cell active' : 'red-cell'}
                                            onClick={() => toggleHabitState(habitToShed, data.date, category, "shed")}
                                            title={data[habitToShed] ? '😢 Avoid this next time!' : '👏 You avoided it!'}
                                        >
                                            {data[habitToShed] ? (
                                                <FontAwesomeIcon icon={faCheck} className="red" />
                                            ) : (
                                                <FontAwesomeIcon icon={faTimes} className="no-show" />
                                            )}
                                        </td>
                                        ))}
                                    </tr>
                                ));

                                //console.log("Habits to adopt rows ", habitsToAdoptRows);
                                //console.log("Habits to shed rows ", habitsToShedRows);

                                if (habitsToAdoptRows.length === 0 && habitsToShedRows.length === 0) {
                                    const retval = <i>No habits being tracked. Create your goals and habits <Link to={`/goals`}>here</Link></i>;
                                    return retval;
                                }
                                else {
                                    return [...(habitsToAdoptRows || []), ...(habitsToShedRows || [])];
                                }
                            });
                            })}
                        </tbody>
                    </table>                                       
                    ): (
                        <i>No habits being tracked. Create your goals and habits <Link to={`/goals`}>here</Link></i>
                    )}
                    </div>
                    )}
                </div>
                )}
                </center>
                {isValidFlyoutState() && (
                            <div className="flyout show">
                                <div className="flyout-header">
                                    <FontAwesomeIcon className="flyout-close" icon={faTimes} onClick={handleCloseFlyout} />
                                </div>
                                <RecommendationsPage type={flyoutState} habit={habit}/>
                            </div>
                )}
                {animation > 0  && 
                    <Confetti gravity={0.2} width={window.width} height={window.height}/>
                }                
            </form>
        </Container>
    );
};

export default SubmitTimePage;