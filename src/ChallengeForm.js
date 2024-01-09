import React, { useState, useRef, useEffect, useCallback } from "react";
import "./ChallengeForm.css";
import { fetchAndInsertToken, getApiHost } from './utils/urlUtil';

function ChallengeForm({ formTitle, textBoxPlaceholder, exclude, onSubmit, onCancel }) {
  const [emailInput, setEmailInput] = useState("");
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [knownEmails, setKnownEmails] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [submitCalled, setSubmitCalled] = useState(false); 
  const inputRef = useRef(null); // Reference to the input field

  useEffect(() => {
    //  get the list of known email addresses
    async function fetchData() {
        const response = await fetchAndInsertToken(getApiHost() + `/getAllUsers?domain=@microsoft.com`);
        const data = await response.json();
        setKnownEmails(JSON.parse(data).map(item => item.username).filter(username => !exclude.includes(username)));
    }

    fetchData();
  }, [exclude]);

  const handleEmailInputChange = (event) => {
    const input = event.target.value;
    setEmailInput(input);
    setIsValidEmail(true); // dont bother the user with invalid email message when they are still typing
    const filteredEmails = knownEmails
          .filter((email) => email.toLowerCase().split('@')[0].includes(input.toLowerCase()) && !selectedEmails.includes(email));
  
    setFilteredEmails(filteredEmails);
    setSelectedIndex(-1);
  };

  const handleEmailSelect = (email) => {
    const isValid = validateEmail(email);
    console.log("For email ", email, ", isValid is ", isValidEmail);
    setIsValidEmail(isValid);
    if (isValid && email && !selectedEmails.includes(email)) {
        setSelectedEmails([...selectedEmails, email]);
        setEmailInput(""); // Clear the input after selecting
    }
    inputRef.current.focus(); // Focus on the input after selecting
  };

  const handleTagRemove = (emailToRemove) => {
    const updatedEmails = selectedEmails.filter((email) => email !== emailToRemove);
    setSelectedEmails(updatedEmails);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
      var selectedEmail = emailInput.trim();
      if (selectedIndex !== -1) {
        selectedEmail = filteredEmails[selectedIndex];        
      }      
      handleEmailSelect(selectedEmail);
    }
    if (event.key === "Escape") {
        event.preventDefault();
        setEmailInput(""); // Clear the input after selecting        
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();        

        if (filteredEmails.length === 0) {
          return;
        }
  
        let newIndex = selectedIndex;
        if (event.key === "ArrowDown") {
          newIndex = (newIndex + 1) % filteredEmails.length;
        } else if (event.key === "ArrowUp") {
          newIndex = (newIndex - 1 + filteredEmails.length) % filteredEmails.length;
        }
  
        setSelectedIndex(newIndex);
    }
  };

  function validateEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (email==="" || pattern.test(email.trim()));
  }
  
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Handle submit got email ", emailInput);
    handleEmailSelect(emailInput);
    setSubmitCalled(true);
  }

  const memoizedOnSubmit = useCallback(onSubmit, [onSubmit]);

  useEffect(() => {
    console.log("New use effect called ", submitCalled);
    if (!submitCalled) return;
    if (!isValidEmail) {setSubmitCalled(false); return;}
    if (selectedEmails.length === 0) {
        setIsValidEmail(false);
        setSubmitCalled(false);
    }
    else {
        memoizedOnSubmit(selectedEmails);
    }
  }, [submitCalled, isValidEmail, selectedEmails, memoizedOnSubmit]);

  const handleCancel = () => {
    var cancel = true;
    if (selectedEmails.length > 0) {
      const confirmDiscard = window.confirm(
        "You have added emails. Are you sure you want to discard them?"
      );
      if (!confirmDiscard) {
        cancel = false;
      }
    }
    if (cancel) {
        setSelectedEmails([]);
        onCancel();
    }
  };

  return (
    <div className="challenge-form">
      <h3>{formTitle}</h3>
      <form onSubmit={handleSubmit}>
        <div className="selected-emails">
          {selectedEmails.map((email) => (
            <span key={email} className="email-tag">
              {email}
              <button
                type="button"
                className="remove-tag"
                onClick={() => handleTagRemove(email)}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <div className="typeahead-container">
          <input
            type="text"
            placeholder={textBoxPlaceholder}
            value={emailInput}
            onChange={handleEmailInputChange}
            onKeyDown={handleKeyPress}
            ref={inputRef}
            className={!isValidEmail ? 'invalid-email' : 'valid-email'}
          />
          {!isValidEmail && (
            <p className="error-message">Please enter a valid email address.</p>
          )}
          {emailInput && (
            <ul className="typeahead-list">
              {filteredEmails.map((email, index) => (
              <li
                key={email}
                onClick={() => handleEmailSelect(email)}
                className={index === selectedIndex ? "selected" : ""}
              >
                {email}
              </li>
              ))}
            </ul>
          )}
        </div>
        <div className="buttons-container">
          <button
            className="cancel-button"
            type="button"
            onClick={(e) => {
                handleCancel();
            }}>
            Cancel
          </button>
          <button className="challenge-button" 
            type="submit">
            Invite
          </button>
        </div>        
      </form>
    </div>
  );
}

export default ChallengeForm;
