import React, { useState } from 'react';
import EditRecommendation from './EditRecommendation';
import './RecommendationTile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faEdit } from '@fortawesome/free-solid-svg-icons';


const RecommendationTile = ({recommendation, handleJoinRecommendation, handleLeaveRecommendation, showDetails, onSave}) => {

    //console.log("Got called with recommendation ", recommendation.participants, "functions ", handleJoinRecommendation, handleLeaveRecommendation, getParticipantsTooltip);
    const [isEditing, setIsEditing] = useState(false);

    const createSharingLink = (e) => {
        e.preventDefault();

        const textarea = document.createElement('textarea');        
        textarea.value = document.location.origin + `/?showHabits=${recommendation.type}&habit=${recommendation._id}`;
    
        // Append the textarea to the document and select its content
        document.body.appendChild(textarea);
        textarea.select();
    
        // Copy the selected text to the clipboard
        document.execCommand('copy');
    
        // Remove the textarea from the document
        document.body.removeChild(textarea);
    
        // You can add a notification or alert to inform the user that the URL has been copied.
        alert('URL copied to clipboard!');
      };

    function getParticipantsTooltip(recommendation) {
        const participants = recommendation.participants;
        if (participants.length === 0)  {
            return "No one here yet. Join and kick it off."
        }
        else{
            return "Circle members: \n" + participants.join('\n');
        }
    }
    
    function handleEditRecommendation(e) {
        e.preventDefault();
        setIsEditing(true);
    }

    function handleCancel() {
        setIsEditing(false);
    }

    function handleSave() {
        // save the recommendation
        onSave(recommendation);
        setIsEditing(false);
    }

    return (
        <div>
        {recommendation && (
            <div>
                <div className="recommendation-tile">
                    <div className="icon">                  
                        <img src={(recommendation.selfOrTogether === 'DIY' ? 'diy.jpg' : (recommendation.selfOrTogether === 'DIT' ? 'dit.jpg' : null))} alt={recommendation.selfOrTogether} />
                        <span className="participants-badge" title={getParticipantsTooltip(recommendation)}>{recommendation.participants.length}</span>                                                      
                        <button className="share-button" title="Share this habit with others" onClick={(e) => createSharingLink(e)}>
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                    </div>
                    <h3 className="title">{recommendation.title}</h3>
                    <h4 className="contributor">(Recommended by: {recommendation.contributor})</h4>
                    {
                    (recommendation.participants.includes(localStorage.getItem('userName')) ? (
                        <button className="leave-button" onClick={(e) => handleLeaveRecommendation(e, recommendation)}>{recommendation.selfOrTogether === 'DIT'? 'Leave Circle':'Drop Habit'}</button>
                    ) : (
                        <button className="join-button" onClick={(e) => handleJoinRecommendation(e, recommendation)}>{recommendation.selfOrTogether === 'DIT'? 'Join Circle':'Make Habit'}</button>
                    ))
                    }        
                    {recommendation.contributor === localStorage.getItem('userName') && showDetails === 1 && (
                        <button
                        className="edit-button"
                        onClick={(e) => handleEditRecommendation(e)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                    )}        
                </div>
                {showDetails === 1 && (
                    <div className="recommendation-details">
                        {!isEditing && (
                            <div dangerouslySetInnerHTML={{ __html: recommendation.details }} />
                        )}
                        {isEditing && (
                            <EditRecommendation recommendation={recommendation} onSave={handleSave} onCancel={handleCancel}/>
                        )}
                    </div>
                )}
            </div>            
        )}
        </div>
    )

}

export default RecommendationTile;