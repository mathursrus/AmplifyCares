import React, { useState } from 'react';
import EditRecommendation from './EditRecommendation';
import './RecommendationTile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faEdit, faUserFriends } from '@fortawesome/free-solid-svg-icons';
import {getAlias} from './utils/userUtil';
import {howLongAgo} from './utils/timeUtil';

const RecommendationTile = ({recommendation, handleJoinRecommendation, handleLeaveRecommendation, showDetails, onSave}) => {

    //console.log("Got called with recommendation ", recommendation.participants, "functions ", handleJoinRecommendation, handleLeaveRecommendation, getParticipantsTooltip);
    const [isEditing, setIsEditing] = useState(false);
    const [comments, setComments] = useState(recommendation.comments?recommendation.comments:[]);
    const [newComment, setNewComment] = useState('');

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
    
    const handleAddComment = (e) => {
        e.preventDefault();
        if (newComment.trim() !== '') {
            // Create a new comment object
            const comment = {
                user: localStorage.getItem('userName'),
                text: newComment,
                date: Date.now()
            };

            recommendation.comments = [...comments, comment];
            // Add the comment to the comments array
            setComments(recommendation.comments);
            
            onSave(recommendation);
            
            // Clear the input field
            setNewComment('');
        }
    };
    
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
        <div className="recommendation-tile-page">
        {recommendation && (
            <div>
                <div className="recommendation-tile">
                    <div className="icon">                  
                        <div className="recommendation-participants-info" title={getParticipantsTooltip(recommendation)}>
                            <FontAwesomeIcon className="badge" icon={faUserFriends} /> {recommendation.participants.length}
                        </div>
                        <img src={(recommendation.selfOrTogether === 'DIY' ? 'diy.jpg' : (recommendation.selfOrTogether === 'DIT' ? 'dit.jpg' : null))} alt={recommendation.selfOrTogether} />                        
                        <button className="share-button" title="Share this habit with others" onClick={(e) => createSharingLink(e)}>
                            <FontAwesomeIcon icon={faShare} />
                        </button>
                    </div>
                    <h3 className="title">{recommendation.title}</h3>
                    <h4 className="contributor">(Recommended by: {recommendation.contributor})</h4>
                    {
                      (recommendation.circlestate === undefined || recommendation.circlestate !== "no changes") ? (
                        (recommendation.participants.includes(localStorage.getItem('userName')) ? (
                            <button className="leave-button" onClick={(e) => handleLeaveRecommendation(e, recommendation)}>{recommendation.selfOrTogether === 'DIT'? 'Leave Circle':'Drop Habit'}</button>
                        ) : (
                            <button className="join-button" onClick={(e) => handleJoinRecommendation(e, recommendation)}>{recommendation.selfOrTogether === 'DIT'? 'Join Circle':'Make Habit'}</button>
                        ))
                      ) : (<div></div>)
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
                            <div>
                                <div dangerouslySetInnerHTML={{ __html: recommendation.details }} />
                                {recommendation.additionalContentsForUser && (<div className="personalized-details" dangerouslySetInnerHTML={{ __html: recommendation.additionalContentsForUser }} />)}                                
                            </div>
                        )}
                        {isEditing && (
                            <EditRecommendation recommendation={recommendation} onSave={handleSave} onCancel={handleCancel}/>
                        )}                        
                    </div>
                )}
                {showDetails === 1 && !isEditing && (
                    <div className="comments-section">
                        <h4>Circle members be like ...</h4><br></br>
                        {comments.length>0? (
                            <div className="comments-block">
                                {comments.map((comment, index) => (
                                <div key={index} className={`comment ${comment.user === localStorage.getItem('userName') ? 'own-comment' : ''}`}>
                                    {comment.text}                                            
                                    <span className='username'>
                                        <i>{getAlias(comment.user)}, </i>
                                        <i>{howLongAgo(comment.date)}</i>
                                    </span>
                                </div>
                                ))}
                            </div>
                        ) : (
                            <center>This is a quiet circle. Say something</center>
                        )}                        
                        <div className="new-comment">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {if (e.key==='Enter') handleAddComment(e)}}                                
                            />
                            <button onClick={(e) => handleAddComment(e)}>Post</button>
                        </div>
                    </div>
                )}
            </div>            
        )}
        </div>
    )

}

export default RecommendationTile;