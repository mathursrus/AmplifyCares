import React, { useState } from 'react';
import './EmojiPicker.css'; // Import the corresponding CSS file

const emojiList = ['😀', '😍', '👍', '❤️', '👏', '🎉', '🥳', '🙌', '😂', '+'];

const EmojiPicker = ({ onEmojiSelect }) => {
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);

  const toggleEmojiPicker = (e) => {
    e.preventDefault();
    setIsEmojiPickerVisible(!isEmojiPickerVisible);
  };

  const handleEmojiClick = (emoji) => {    
    onEmojiSelect(emoji);
    setIsEmojiPickerVisible(false);
  };

  return (
    <div className="emojis-container">
      <button
        className="emoji-toggle-button"
        onClick={(e) => toggleEmojiPicker(e)}
      >
        {'😀'}
      </button>

      {isEmojiPickerVisible && (
        <div className="emoji-picker">
        {emojiList.map((emoji, index) => (
          <span
            key={emoji}
            className="emoji"
            onClick={() => handleEmojiClick(emoji)}
            style={{ marginRight: (index + 1) % 6 === 0 ? 0 : '10px' }} // Add margin-right to create rows
          >
            {emoji}
          </span>
        ))}
      </div>      
      )}
    </div>
  );
};

export default EmojiPicker;
