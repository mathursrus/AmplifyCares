import React, { useState, useEffect, useCallback } from 'react';
import EditRecommendation from './EditRecommendation';
import './RecommendationTile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShare, faEdit, faUserFriends, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import {getAlias} from './utils/userUtil';
import {howLongAgo} from './utils/timeUtil';
import { addCommentToRecommendation, getRecommendationComments, writeRecommendationComment, writeReactionToComment } from './utils/recommendationUtil';
import EmojiPicker from './EmojiPicker';

const RecommendationTile = ({recommendation, handleJoinRecommendation, handleLeaveRecommendation, showDetails, onSave, onDelete}) => {

    //console.log("Got called with recommendation ", recommendation.participants, "functions ", handleJoinRecommendation, handleLeaveRecommendation, getParticipantsTooltip);
    const [isEditing, setIsEditing] = useState(false);
    const [comments, setComments] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editedText, setEditedText] = useState(''); 
    const [commentReactions, setCommentReactions] = useState({}); 

    const buildReactionsMap = useCallback (async (comments) => {
        const initialCommentReactions = {};
        // Iterate through the comments and extract reaction data
        comments.forEach((comment) => {
        const commentId = comment._id;

        // Initialize an object to store reactions for this comment
        const commentReactionsData = {};

        // Iterate through reactions for the comment and build the data
        comment.reactions.forEach((reaction) => {
            const { emoji, user } = reaction;

            // Initialize an array for the emoji if it doesn't exist
            if (!commentReactionsData[emoji]) {
                commentReactionsData[emoji] = [];
            }

            // Add the user to the emoji's list
            commentReactionsData[emoji].push(user);
            console.log("Added reaction ", reaction);
        });

        // Store the comment reactions data in the map
        initialCommentReactions[commentId] = commentReactionsData;
        });    
        setCommentReactions(initialCommentReactions);
    }, []);

    const refreshComments = useCallback (async () => {
        const result = await getRecommendationComments(recommendation._id);
        buildReactionsMap(result);
        setComments(null);
        setComments(result);        
    }, [recommendation._id, buildReactionsMap]);

    useEffect(() => {
        async function fetchData() {
            if (showDetails) {
                refreshComments();
            }
        }
        fetchData();
    }, [refreshComments, showDetails]);
        
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
            addCommentToRecommendation(recommendation._id, newComment);
            // Refresh comments            
            refreshComments();                    
            // Clear the input field
            setNewComment('');
        }
    };
    
    const handleEditComment = (comment) => {
        console.log("Called edit comment with comment ", comment.text);
        setEditingComment(comment);
        setEditedText(comment.text);
    }

    const handleSaveEdit = async (e, comment) => {
        e.preventDefault();
        comment.text = editedText;
        setEditingComment(null);
        await writeRecommendationComment(comment);
        refreshComments();        
    };

    const handleDeleteComment = async (comment) => {
        console.log("Called delete comment with comment ", comment.text);
        const shouldDelete = window.confirm("Are you sure you want to delete this comment?");
        if (shouldDelete) {
            comment.text = '';
            await writeRecommendationComment(comment);
            refreshComments();
        }
    }

    const handleAddReactionToComment = async (reaction, comment) => {
        console.log("Adding reaction to comment ", reaction, comment.text);
        await writeReactionToComment(reaction, comment._id);
        refreshComments();
    }

    function handleEditRecommendation(e) {
        e.preventDefault();
        setIsEditing(true);
    }

    function handleDeleteRecommendation(e)  {
        e.preventDefault();
        const shouldDelete = window.confirm("Are you sure you want to delete this self care circle?");
        if (shouldDelete) {
            setIsEditing(false);
            onDelete(recommendation);
        }
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
                        <div>
                        <button
                        className="edit-button"
                        onClick={(e) => handleEditRecommendation(e)}
                        >
                            <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                        className="delete-button"
                        onClick={(e) => handleDeleteRecommendation(e)}
                        >
                            <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                        </div>
                    )}        
                </div>
                {showDetails === 1 && (
                    <div className="recommendation-details">
                        <center><h4>Circle Details ...</h4></center><br></br>
                        {!isEditing && (
                            <div>
                                {(recommendation.details && recommendation.details !== '')? (
                                    <div dangerouslySetInnerHTML={{ __html: recommendation.details }} />
                                ):(<center>{recommendation.contributor} has not added any description. Tell them to hit the edit button and tell you about their circle</center>)
                                }
                                {recommendation.additionalContentsForUser && (<div className="personalized-details" dangerouslySetInnerHTML={{ __html: recommendation.additionalContentsForUser }} />)}                                
                            </div>
                        )}
                        {isEditing && (
                            <div>
                                <center><i>Make your circle description interesting for others to join</i></center><br></br>
                                <EditRecommendation recommendation={recommendation} onSave={handleSave} onCancel={handleCancel}/>
                            </div>
                        )}                        
                    </div>
                )}
                {showDetails === 1 && !isEditing && (
                    <div className="comments-section">
                        <h4>Circle members be like ...</h4><br></br>
                        {comments? (
                            (comments.length>0? (
                            <div className="comments-block">
                                {comments.map((comment, index) => (
                                <div>
                                <div key={index} className={`comment ${comment.user === localStorage.getItem('userName') ? 'own-comment' : ''}`}>                                    
                                    {editingComment === comment ? (
                                        // Render an input field for editing when in edit mode
                                        <div>
                                            <input
                                                type="text"
                                                value={editedText}
                                                onChange={(e) => setEditedText(e.target.value)}
                                            />
                                            <button onClick={(e) => handleSaveEdit(e, comment)}>Save</button>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className='comment-actions'>
                                                {comment.user === localStorage.getItem('userName') && (
                                                    <div>                                                
                                                        <i className='edit-icon' onClick={() => handleEditComment(comment)}>
                                                        <FontAwesomeIcon icon={faEdit} />
                                                        </i>
                                                        <i className='delete-icon' onClick={() => handleDeleteComment(comment)}>
                                                        <FontAwesomeIcon icon={faTrashAlt} />
                                                        </i>
                                                    </div>
                                                )}  
                                                <EmojiPicker onEmojiSelect={(e) => handleAddReactionToComment(e, comment)} />                                                
                                            </div>  
                                            {comment.text}                                        
                                            <span className='username'>
                                                <i>{getAlias(comment.user)}, </i>
                                                <i>{howLongAgo(comment.date)}</i>                                        
                                            </span>
                                            {/**
                                            <div className="comment-reactions">   
                                                <span className="comment-reaction">
                                                    <span onClick={()=>handleAddReactionToComment('😂', comment)} className="emoji">😂</span>
                                                    <span className="count">1</span>
                                                </span>                                         
                                                <span className="comment-reaction">
                                                    <span onClick={()=>handleAddReactionToComment('❤️', comment)} className="emoji">❤️</span>
                                                    <span className="count">2</span>
                                                </span>                                         
                                            </div>
                                             */}
                                             <div className='comment-reactions'>
                                                {Object.entries(commentReactions[comment._id] || {}).map(([emoji, users]) => (
                                                    <span key={emoji} className="comment-reaction">
                                                    <span
                                                        onClick={() => handleAddReactionToComment(emoji, comment)}
                                                        className="emoji"
                                                        title={`Users: ${users.join(', ')}`} // Tooltip with user names
                                                    >
                                                        {emoji}
                                                    </span>
                                                    <span className="count">{users.length}</span>
                                                    </span>
                                                ))}
                                                </div>
                                        </div>
                                    )}                                    
                                </div>                                
                                </div>
                                ))}
                            </div>
                            ) : (
                                <center>This is a quiet circle. Say something</center>
                            ))                            
                        ) : ( <center> Loading ... </center> )}                        
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