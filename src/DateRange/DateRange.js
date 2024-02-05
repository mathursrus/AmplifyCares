import React from 'react';
//import Button from 'react-bootstrap/Button';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretLeft } from "@fortawesome/free-solid-svg-icons";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import './DateRange.css';

export const DateRange = ({startDay, endDay, setStartDay, setEndDay, message, image, imageTitle, onImageClick}) => {
    return (
        <>
            <br></br>
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>                    
                    <FontAwesomeIcon icon={faCaretLeft} 
                        style={{ color: 'black', backgroundColor: 'gray'}} 
                        onClick={() => {
                            const newStartDay = new Date(startDay.getFullYear(), startDay.getMonth() - 1, 1);
                            const newEndDay = new Date(endDay.getFullYear(), endDay.getMonth() - 1 + 1, 0);
                            setStartDay(newStartDay);
                            setEndDay(newEndDay);
                        }}
                    />                    
                </div>
                
                <div className="message-container">
                    <h3 className='dateheader'>{message}</h3>
                    {image && (
                    <span className="stats-image">
                        <img src={image} alt={imageTitle} title={imageTitle} 
                        onClick={(event) => {
                            event.preventDefault();
                            onImageClick()}}/>
                    </span>
                    )}
                </div>

                <div>                    
                    <FontAwesomeIcon 
                        icon={faCaretRight} 
                        style={{ color: 'black', backgroundColor: 'gray'}} 
                        onClick={() => {
                            const newStartDay = new Date(startDay.getFullYear(), startDay.getMonth() + 1, 1);
                            const newEndDay = new Date(endDay.getFullYear(), endDay.getMonth() + 1 + 1, 0);
                            setStartDay(newStartDay);
                            setEndDay(newEndDay);
                        }}
                    />                    
                </div>
            </div>
            {/*<div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div><i>{new Date(startDay.getFullYear(), startDay.getMonth() - 1, 1).toLocaleDateString("en-US", {month: "long"})}</i></div>
                <div><i>{new Date(startDay.getFullYear(), startDay.getMonth() + 1, 1).toLocaleDateString("en-US", {month: "long"})}</i></div>
                </div>*/}
        </>
    );
};