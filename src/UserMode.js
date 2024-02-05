import './UserMode.css';
import { getUserMode, setUserMode } from './utils/userUtil';

const UserMode = ({setMode}) => {

    const handleModeToggle = () => {
        //console.log("Toggling mode ", getUserMode());
        if (getUserMode() === "Performance") {
            setUserMode("Improvement");
            setMode("Improvement");
            return;      
        }
        setUserMode("Performance");
        setMode("Performance");
    };
        
    return (
        <center>
            <img
            src="/self-improvement-icon.png"
            alt="Improvement Mode"
            title="Improvement Mode"
            height="30px"
            width="30px"
            />
            <div className="user-mode-container">
                <label className="switch">
                    <input type="checkbox" className="toggle-input" onChange={handleModeToggle} checked={getUserMode() === "Performance"} />
                    <span className="slider"></span>
                    <span className="toggle-label">{getUserMode()}</span>
                </label>
            </div>
            <img
            src="/competition-icon.png"
            alt="Performance Mode"
            title="Performance Mode"
            height="25px"
            width="30px"
            />
        </center>
    );
};

export default UserMode;