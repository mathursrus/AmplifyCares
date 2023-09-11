//import React from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Confetti from "react-confetti";
import RecommendationsPage from './RecommendationsPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getApiHost } from './utils/urlUtil';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import { evaluate } from 'mathjs';
import 'react-datepicker/dist/react-datepicker.css';
import './SubmitTime.css';
import UserBadges from './UserBadges';
import { ReactTags } from 'react-tag-autocomplete';

const React = require('react');
const { useState, useEffect, useCallback } = React;

const placeholderStrings = {
    MentalHealth: 'Minutes you dedicated to mental health.',
    PhysicalHealth: 'Minutes you dedicated to physical health.',
    SpiritualHealth: 'Minutes you dedicated to spirtual health.',
    SocialHealth: 'Minutes you dedicated to social health.'
};

const wellKnownTags = {
    MentalHealth: ['meditation', 'learning', 'brain games', /* Add more tags here */],
    PhysicalHealth: ['exercise', 'sports', 'doctor visit', /* Add more tags here */],
    SpiritualHealth: ['prayers', 'religious activities', /* Add more tags here */],
    SocialHealth: ['volunteering', 'team lunch', 'mentoring', /* Add more tags here */],
  };
  

const SubmitTimePage = () => {
    const [MentalHealth, setMentalHealth] = useState({ time: '', tags: [] });
    const [PhysicalHealth, setPhysicalHealth] = useState({ time: '', tags: [] });
    const [SpiritualHealth, setSpiritualHealth] = useState({ time: '', tags: [] });
    const [SocialHealth, setSocialHealth] = useState({ time: '', tags: [] });
    // Create a state variable to store the selected animation
    const [animation, setAnimation] = React.useState(null);
    //const clapSounds = [new Audio('/claps.wav'), new Audio('/yourock.mp3'), new Audio('/musicclip.mp3'), new Audio('/crowd.mp3')];
    const navigate = useNavigate();
    const [flyoutState, setFlyoutState] = useState(0);
    const [selectedDate, setSelectedDate] = useState(new Date());


    // Create a function to generate a random number between 1 and 4
    const getRandomNumber = () => {
        return Math.floor(Math.random() * 4) + 1;
    };

    const getSubmissionTime = () => {
        // Get Current Date
        /*var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        var dateTime = date+' '+time;
        console.log(dateTime);
        return today;*/

        const date = selectedDate.toLocaleDateString();
        console.log(date);
        return date;
    }

    /*const playSound = (rand) => {
        console.log("Playing with rand ", rand, " Clip ", clapSounds[rand]);
        clapSounds[rand-1].play();
    }*/

    const handleSubmit = async(e) => {
        //e.preventDefault();
        console.log(e);
        // Submit form data
        const itemData = {
            name: localStorage.getItem('userName'),
            DateTime: getSubmissionTime(),
            mental_health_time: MentalHealth.time === '' ? 0 : parseInt(MentalHealth.time),
            mental_health_activity: MentalHealth.tags.map(item => item.label),
            physical_health_time: PhysicalHealth.time === '' ? 0 : parseInt(PhysicalHealth.time),
            physical_health_activity: PhysicalHealth.tags.map(item => item.label),
            spiritual_health_time: SpiritualHealth.time === '' ? 0 : parseInt(SpiritualHealth.time),
            spiritual_health_activity: SpiritualHealth.tags.map(item => item.label),
            societal_health_time: SocialHealth.time === '' ? 0 : parseInt(SocialHealth.time),
            societal_health_activity: SocialHealth.tags.map(item => item.label),
        }
        console.log(itemData)
        const response = await fetch(getApiHost()+"/writeselfcare/?item="+JSON.stringify(itemData));

        if (!response.ok) {
            console.log("Ugh");
        }
        // Set the state variable to the random number
        const rand = getRandomNumber();
        setAnimation(rand);
        //playSound(rand);            
            
        setTimeout(() => {
            setAnimation(null);
            navigate('/summary-page');
        }, 6000);
    };

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
        setFlyoutState(0);
        console.log("Clicked close");        
    }        
    
    useEffect(() => {
        console.log("Flyout state is ", flyoutState); 
      }, [flyoutState]); // Run the effect only when flyoutState changes

    return (
        <Container className="p-3">    
            <div>
                <UserBadges badges={JSON.parse(localStorage.getItem('badges'))} />
            </div>        
            <form>
                <center>
                    Select the date you're submitting time for  
                    <DatePicker
                    selected={selectedDate}
                    onChange={(date) => {console.log("Selected date ", date); setSelectedDate(date)}}
                    dateFormat="MM/dd/yyyy"
                    className="date-picker"
                    />
                </center>

                <div className='row'>
                    <label className='formLabel'>
                        <b>Mental Health</b>                    
                        <a href="a" onClick={mentalHealthRecommendations}>
                            <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                        </a>                        
                    </label>
                    <div className="input-container">
                        <input
                            type="text"
                            className="text-field time-input"
                            value={MentalHealth.time}
                            onChange={(e) => {
                                const input = e.target.value;
                                try {
                                    const result = evaluate(input);
                                    const time = result.toString();
                                    console.log("Time is ", time);
                                    setMentalHealth((prev) => ({ ...prev, time }));
                                } catch (error) {
                                    const time = '';
                                    setMentalHealth((prev) => ({ ...prev, time }));
                                }
                            }}
                            placeholder={placeholderStrings.MentalHealth}
                        />
                        <ReactTags
                            selected={MentalHealth.tags}
                            suggestions={wellKnownTags.MentalHealth.map((name, index) => ({ value: index, label: name }))}
                            onDelete={useCallback(
                                (tagIndex) => {
                                    setMentalHealth(((prev) => ({ ...prev, tags: (MentalHealth.tags.filter((_, i) => i !== tagIndex))})));                                    
                                }, [MentalHealth.tags])}
                            onAdd={useCallback(
                                (newTag) => {
                                    setMentalHealth(((prev) => ({ ...prev, tags: [...MentalHealth.tags, newTag] })))            
                                }, [MentalHealth.tags])}
                            placeholderText="Select or Add activity"
                            allowNew="true"
                            labelText=''
                            collapseOnSelect="true"
                        />                        
                    </div>
                </div>
                <br></br>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Physical Health</b>
                        <a href="a" onClick={physicalHealthRecommendations}>
                            <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                        </a>
                    </label>
                    <div className="input-container">
                        <input
                            type="text"
                            className="text-field time-input"
                            value={PhysicalHealth.time}
                            onChange={(e) => {
                                const input = e.target.value;
                                try {
                                    const result = evaluate(input);
                                    const time = result.toString();
                                    console.log("Time is ", time);
                                    setPhysicalHealth((prev) => ({ ...prev, time }));
                                } catch (error) {
                                    const time = '';
                                    setPhysicalHealth((prev) => ({ ...prev, time }));
                                }
                            }}
                            placeholder={placeholderStrings.PhysicalHealth}
                        />
                        <ReactTags
                            selected={PhysicalHealth.tags}
                            suggestions={wellKnownTags.PhysicalHealth.map((name, index) => ({ value: index, label: name }))}
                            onDelete={useCallback(
                                (tagIndex) => {
                                    setPhysicalHealth(((prev) => ({ ...prev, tags: (PhysicalHealth.tags.filter((_, i) => i !== tagIndex))})));                                    
                                }, [PhysicalHealth.tags])}
                            onAdd={useCallback(
                                (newTag) => {
                                    setPhysicalHealth(((prev) => ({ ...prev, tags: [...PhysicalHealth.tags, newTag] })))            
                                }, [PhysicalHealth.tags])}
                            placeholderText="Select or Add activity"
                            allowNew="true"
                            labelText=''
                            collapseOnSelect="true"
                        />                        
                    </div>
                </div>
                <br></br>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Spiritual Health</b>
                        <a href="a" onClick={spiritualHealthRecommendations}>
                            <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                        </a>
                    </label>
                    <div className="input-container">
                        <input
                            type="text"
                            className="text-field time-input"
                            value={SpiritualHealth.time}
                            onChange={(e) => {
                                const input = e.target.value;
                                try {
                                    const result = evaluate(input);
                                    const time = result.toString();
                                    console.log("Time is ", time);
                                    setSpiritualHealth((prev) => ({ ...prev, time }));
                                } catch (error) {
                                    const time = '';
                                    setSpiritualHealth((prev) => ({ ...prev, time }));
                                }
                            }}
                            placeholder={placeholderStrings.SpiritualHealth}
                        />
                        <ReactTags
                            selected={SpiritualHealth.tags}
                            suggestions={wellKnownTags.SpiritualHealth.map((name, index) => ({ value: index, label: name }))}
                            onDelete={useCallback(
                                (tagIndex) => {
                                    setSpiritualHealth(((prev) => ({ ...prev, tags: (SpiritualHealth.tags.filter((_, i) => i !== tagIndex))})));                                    
                                }, [SpiritualHealth.tags])}
                            onAdd={useCallback(
                                (newTag) => {
                                    setSpiritualHealth(((prev) => ({ ...prev, tags: [...SpiritualHealth.tags, newTag] })))            
                                }, [SpiritualHealth.tags])}
                            placeholderText="Select or Add activity"
                            allowNew="true"
                            labelText=''
                            collapseOnSelect="true"
                        />                        
                    </div>
                </div>
                <br></br>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Social Health</b>
                        <a href="http://a.b" onClick={socialHealthRecommendations}>
                            <FontAwesomeIcon icon={faInfoCircle} style={{ color: '#306DC8', marginLeft: '5px' }} />
                        </a>
                    </label>
                    <div className="input-container">
                        <input
                            type="text"
                            className="text-field time-input"
                            value={SocialHealth.time}
                            onChange={(e) => {
                                const input = e.target.value;
                                try {
                                    const result = evaluate(input);
                                    const time = result.toString();
                                    console.log("Time is ", time);
                                    setSocialHealth((prev) => ({ ...prev, time }));
                                } catch (error) {
                                    const time = '';
                                    setSocialHealth((prev) => ({ ...prev, time }));
                                }
                            }}
                            placeholder={placeholderStrings.SocialHealth}
                        />
                        <ReactTags
                            selected={SocialHealth.tags}
                            suggestions={wellKnownTags.SocialHealth.map((name, index) => ({ value: index, label: name }))}
                            onDelete={useCallback(
                                (tagIndex) => {
                                    setSocialHealth(((prev) => ({ ...prev, tags: (SocialHealth.tags.filter((_, i) => i !== tagIndex))})));                                    
                                }, [SocialHealth.tags])}
                            onAdd={useCallback(
                                (newTag) => {
                                    setSocialHealth(((prev) => ({ ...prev, tags: [...SocialHealth.tags, newTag] })))            
                                }, [SocialHealth.tags])}
                            placeholderText="Select or Add activity"
                            allowNew="true"
                            labelText=''
                            collapseOnSelect="true"
                        />                        
                    </div>
                </div>
                {flyoutState > 0 && (
                            <div className="flyout show">
                                <div className="flyout-header">
                                    <FontAwesomeIcon className="flyout-close" icon={faTimes} onClick={handleCloseFlyout} />
                                </div>
                                <RecommendationsPage type={flyoutState}/>
                            </div>
                )}
                <br></br>
                <br></br>
                <div className='row'>
                    <Button onClick={handleSubmit}><b>Submit Your Self-Care Time</b></Button>
                    {animation === 1 && <Confetti/>}
                    {animation === 2 && <Confetti/>}
                    {animation === 3 && <Confetti/>}
                    {animation === 4 && <Confetti/>}                    
                </div>
            </form>
        </Container>
    );
};

export default SubmitTimePage;