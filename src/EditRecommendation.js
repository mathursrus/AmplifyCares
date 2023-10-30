import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import './EditRecommendation.css';

const EditRecommendation = ({ recommendation, onSave, onCancel }) => {
  const [editorHtml, setEditorHtml] = useState(recommendation.details);

  const handleChange = (html) => {
    setEditorHtml(html);
  };

  const handleSave = (e) => {
    e.preventDefault();        
    // Update the recommendation details with the edited HTML content
    recommendation.details = editorHtml;
    onSave();
  };

  const handleCancel = (e) => {
    e.preventDefault();            
    onCancel();
  };

  return (
    <div className="edit-recommendation-container">
      <div className="editor-container">
        <ReactQuill
          value={editorHtml}
          onChange={handleChange}
          modules={{ toolbar: true }}
        />
      </div>
      <div className="button-container">        
        <button className="save-button" onClick={handleSave}>
          Save
        </button>
        <button className="cancel-button" onClick={handleCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditRecommendation;
