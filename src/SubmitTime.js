//import React from 'react';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Confetti from "react-confetti";
import { getApiHost } from './utils/urlUtil';
import { useNavigate } from 'react-router-dom';
import './App.css';
import * as microsoftTeams from '@microsoft/teams-js';

const React = require('react');
const { useState } = React;

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
    const [UserName, setUserName] = useState('');
    // Create a state variable to store the selected animation
    const [animation, setAnimation] = React.useState(null);
    const clapSound = new Audio('/yourock.mp3');
    const navigate = useNavigate();

    if (microsoftTeams) {
        microsoftTeams.initialize();
        microsoftTeams.getContext((context) => {
            console.log(context.userPrincipalName);
            setUserName(context.userPrincipalName);
        });
    } 
    else {
        console.log("not in teams");
    }

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
        return dateTime;
    }

    const playSound = (rand) => {
        clapSound.play();
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        console.log(e);
        // Submit form data
        const itemData = {
        name: UserName,
        time: getSubmissionTime(),
        mental_health_time: MentalHealth===''?"0":MentalHealth,
        physical_health_time: PhysicalHealth===''?"0":PhysicalHealth,
        spiritual_health_time: SpiritualHealth===''?"0":SpiritualHealth,
        societal_health_time: SocialHealth===''?"0":SocialHealth,
        }
        console.log(itemData)
        const response = await fetch(getApiHost()+"/writeselfcare/?item="+JSON.stringify(itemData));

        if (!response.ok) {
            console.log("Ugh");
        }
        // Set the state variable to the random number
        const rand = getRandomNumber();
        setAnimation(rand);
        setTimeout(() => {
            playSound(rand);            
            setAnimation(null);
            navigate('/summary-page');
        }, 6000);
    };

    return (
        <Container className="p-3">
            <center>
            <h1 className="header">Welcome {UserName} to AmplifyCares</h1>
            <h2 className="subheader">A platform designed to encourage and measure self care. Enter below the amount of minutes you dedicated to self care today.</h2>
            <br></br>
            <br></br>
            <form>
                <div className='row'>
                <label className='formLabel'><b>Mental Health</b></label>
                <input type="number" class="text-field" value={MentalHealth} onChange={(e) => setMentalHealth(e.target.value)} placeholder={placeholderStrings.MentalHealth}/>
                </div>
                <br></br>
                <div className='row'>
                <label className='formLabel'><b>Physical Health</b></label>
                <input type="number" class="text-field" value={PhysicalHealth} onChange={(e) => setPhysicalHealth(e.target.value)} placeholder={placeholderStrings.PhysicalHealth}/>
                </div>
                <br></br>
                <div className='row'>
                <label className='formLabel'><b>Spiritual Health</b></label>
                <input type="number" class="text-field" value={SpiritualHealth} onChange={(e) => setSpiritualHealth(e.target.value)} placeholder={placeholderStrings.SpiritualHealth}/>
                </div>
                <br></br>
                <div className='row'>
                <label className='formLabel'><b>Societal Health</b></label>
                <input type="number" class="text-field" value={SocialHealth} onChange={(e) => setSocialHealth(e.target.value)}  placeholder={placeholderStrings.SocialHealth}/>
                </div>
                <br></br>
                <br></br>
                <div className='row'>
                    <Button onClick={handleSubmit}><b>Submit Your Self-Care Time</b></Button>
                    {/* Use conditional rendering to show the corresponding animation component */}
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