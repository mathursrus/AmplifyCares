import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Confetti from "react-confetti";
import './App.css';
import { getApiHost } from './utils/urlUtil';

const React = require('react');
const { useState } = React;


const EntryPage = () => {
  const [MentalHealth, setMentalHealth] = useState('0');
  const [PhysicalHealth, setPhysicalHealth] = useState('0');
  const [SpiritualHealth, setSpiritualHealth] = useState('0');
  const [SocietalHealth, setSocietalHealth] = useState('0');
  // Create a state variable to store the selected animation
  const [animation, setAnimation] = React.useState(null);
  const clapSound = new Audio('/yourock.mp3');

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

  const handleSubmit = async(e) => {
    e.preventDefault();
    console.log(e);
    // Submit form data
    const itemData = {
      name:'3rd person',
      time: getSubmissionTime(),
      mental_health_time: MentalHealth,
      physical_health_time: PhysicalHealth,
      spiritual_health_time: SpiritualHealth,
      societal_health_time: SocietalHealth,
    }
    console.log(itemData)
    const response = await fetch( getApiHost() + "/writeselfcare/?item="+JSON.stringify(itemData));

    if (!response.ok) {
      console.log("Ugh");
    }
    // Set the state variable to the random number
    setAnimation(getRandomNumber());
    clapSound.play();
    setTimeout(() => {
      setAnimation(null);
    }, 3000);
  };

  return (
    <Container className="p-3">
      <center>
        <h1 className="header">Welcome to AmplifyCares</h1>
        <h2 className="subheader">A platform designed to encourage and measure self care. Enter below the amount of minutes you dedicated to self care today.</h2>
        <br></br>
        <br></br>
        <form>
          <div className='row'>
            <label className='formLabel'><b>Mental Health</b></label>
            <input type="number" class="text-field" value={MentalHealth} onChange={(e) => setMentalHealth(e.target.value)} />
          </div>
          <br></br>
          <div className='row'>
            <label className='formLabel'><b>Physical Health</b></label>
            <input type="number" class="text-field" value={PhysicalHealth} onChange={(e) => setPhysicalHealth(e.target.value)} />
          </div>
          <br></br>
          <div className='row'>
            <label className='formLabel'><b>Spiritual Health</b></label>
            <input type="number" class="text-field" value={SpiritualHealth} onChange={(e) => setSpiritualHealth(e.target.value)} />
          </div>
          <br></br>
          <div className='row'>
            <label className='formLabel'><b>Societal Health</b></label>
            <input type="number" class="text-field" value={SocietalHealth} onChange={(e) => setSocietalHealth(e.target.value)} />
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

export default EntryPage;