//import React from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Confetti from "react-confetti";
import RecommendationsPage from './RecommendationsPage';
import { useSpring, animated } from 'react-spring';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLightbulb, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getApiHost } from './utils/urlUtil';
import { useNavigate } from 'react-router-dom';
import './App.css';

const React = require('react');
const { useState, useEffect } = React;

const placeholderStrings = {
    MentalHealth: 'Minutes you dedicated to mental health today. (eg meditation, learning, brain games, ..)',
    PhysicalHealth: 'Minutes you dedicated to physical health today. (eg exercise, sports, doctor visit, ..)',
    SpiritualHealth: 'Minutes you dedicated to spirtual health today. (eg prayers, religious activities, ...)',
    SocialHealth: 'Minutes you dedicated to social health today. (eg volunteering, praising, family time, ...)'
}

const SubmitTimePage = () => {
    const [MentalHealth, setMentalHealth] = useState('');
    const [PhysicalHealth, setPhysicalHealth] = useState('');
    const [SpiritualHealth, setSpiritualHealth] = useState('');
    const [SocialHealth, setSocialHealth] = useState('');
    //const [UserName, setUserName] = useState('');
    // Create a state variable to store the selected animation
    const [animation, setAnimation] = React.useState(null);
    const clapSounds = [new Audio('/claps.wav'), new Audio('/yourock.mp3'), new Audio('/musicclip.mp3'), new Audio('/crowd.mp3')];
    const navigate = useNavigate();
    const [flyoutState, setFlyoutState] = useState(0);

    const springProps = useSpring({
        opacity: 1, // Target opacity value
        from: { opacity: 0 }, // Starting opacity value
        config: { duration: 500 }, // Animation duration in milliseconds
      });

    
    // Create a function to generate a random number between 1 and 4
    const getRandomNumber = () => {
        return Math.floor(Math.random() * 4) + 1;
    };
    
    
    const getSubmissionTime = () => {
        // Get Current Date
        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

        // Get Current Time
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        // Display Current Date Time
        var dateTime = date+' '+time;
        console.log(dateTime);
        return today;
    }

    const playSound = (rand) => {
        console.log("Playing with rand ", rand, " Clip ", clapSounds[rand]);
        clapSounds[rand-1].play();
    }

    const handleSubmit = async(e) => {
        //e.preventDefault();
        console.log(e);
        // Submit form data
        const itemData = {
        name: localStorage.getItem('userName'),
        DateTime: getSubmissionTime(),
        mental_health_time: MentalHealth===''?0:parseInt(MentalHealth),
        physical_health_time: PhysicalHealth===''?0:parseInt(PhysicalHealth),
        spiritual_health_time: SpiritualHealth===''?0:parseInt(SpiritualHealth),
        societal_health_time: SocialHealth===''?0:parseInt(SocialHealth),
        }
        console.log(itemData)
        const response = await fetch(getApiHost()+"/writeselfcare/?item="+JSON.stringify(itemData));

        if (!response.ok) {
            console.log("Ugh");
        }
        // Set the state variable to the random number
        const rand = getRandomNumber();
        setAnimation(rand);
        playSound(rand);            
            
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
            <center>
            <h1 className="header">Welcome {localStorage.getItem('userName')} to AmplifyCares</h1>
            <h2 className="subheader">A platform designed to encourage and measure self care. Enter below the amount of minutes you dedicated to self care today.</h2>
            <br></br>
            <br></br>
            <form>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Mental Health</b>                    
                        <a href="#" onClick={mentalHealthRecommendations}>
                            <FontAwesomeIcon icon={faLightbulb} style={{ color: 'gray', marginLeft: '5px' }} />
                        </a>                        
                    </label>
                    <input type="number" class="text-field" value={MentalHealth} onChange={(e) => setMentalHealth(e.target.value)} placeholder={placeholderStrings.MentalHealth}/>
                </div>
                <br></br>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Physical Health</b>
                        <a href="#" onClick={physicalHealthRecommendations}>
                            <FontAwesomeIcon icon={faLightbulb} style={{ color: 'gray', marginLeft: '5px' }} />
                        </a>
                    </label>
                    <input type="number" class="text-field" value={PhysicalHealth} onChange={(e) => setPhysicalHealth(e.target.value)} placeholder={placeholderStrings.PhysicalHealth}/>
                </div>
                <br></br>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Spiritual Health</b>
                        <a href="#" onClick={spiritualHealthRecommendations}>
                            <FontAwesomeIcon icon={faLightbulb} style={{ color: 'gray', marginLeft: '5px' }} />
                        </a>
                    </label>
                    <input type="number" class="text-field" value={SpiritualHealth} onChange={(e) => setSpiritualHealth(e.target.value)} placeholder={placeholderStrings.SpiritualHealth}/>
                </div>
                <br></br>
                <div className='row'>
                    <label className='formLabel'>
                        <b>Social Health</b>
                        <a href="#" onClick={socialHealthRecommendations}>
                            <FontAwesomeIcon icon={faLightbulb} style={{ color: 'gray', marginLeft: '5px' }} />
                        </a>
                    </label>
                    <input type="number" class="text-field" value={SocialHealth} onChange={(e) => setSocialHealth(e.target.value)}  placeholder={placeholderStrings.SocialHealth}/>
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
            </center>
        </Container>
    );
};

export default SubmitTimePage;