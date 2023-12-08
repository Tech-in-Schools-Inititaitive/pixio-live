import React, { useState, useContext, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { PromptContext } from './PromptContext';


const EditValueButton: React.FC = () => {
  const [showInput, setShowInput] = useState(false);
  const { strength, setStrength, guidanceScale, setGuidanceScale, seed, setSeed, imageDataUri } = useContext(PromptContext);

  const { numInferenceSteps, setNumInferenceSteps } = useContext(PromptContext);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: Dispatch<SetStateAction<number>>) => {
    const value = parseFloat(e.target.value);
    setter(isNaN(value) ? 1 : value); // Default to 1 if value is not a number
  };
  
  

  const handleCloseInput = () => {
    setShowInput(false);
    // Apply updates when closing the input panel
    setStrength(strength);
    setGuidanceScale(guidanceScale);
    setSeed(seed);
  };

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageDataUri;
    link.download = 'downloadedImage.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buttonStyle = {
    padding: '10px 20px',
    fontSize: '16px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '10px'
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const, // Ensure TypeScript recognizes the specific CSS value
    alignItems: 'center',
    marginTop: '10px'
  };
  
  const inputContainerStyle = {
    marginBottom: '10px'
  };

  const inputStyle = {
    padding: '10px',
    width: '100%', // Full width within the container
    border: '2px solid #4CAF50',
    borderRadius: '5px',
    marginBottom: '10px'
  };
  
  const labelStyle = {
    fontWeight: 'bold', // Make the label text bold
    marginBottom: '5px' // Spacing between label and input
  };
  
  const closeButtonStyle = {
    padding: '5px 10px',
    backgroundColor: 'red', // Red background for the button
    color: 'white', // White text color
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px' // Spacing from the last input
  };
  const menuStyle = {
    marginTop: '10px',
    width: '300px', // Fixed width for the container
    backgroundColor: 'white', // White background for the menu
    padding: '15px', // Padding inside the menu
    borderRadius: '5px', // Rounded corners for the menu
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' // Optional shadow for a subtle depth effect
  };
return (
  <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(120px)', zIndex: 1000 }}>
    <button onClick={() => setShowInput(!showInput)} style={buttonStyle}>Edit Value</button>
    <button onClick={downloadImage} style={buttonStyle}>Download Image</button>
    {showInput && (
      <div style={menuStyle}>
        <label style={labelStyle}>Seed:</label>
        <input type="number" value={seed.toString()} onChange={(e) => handleInputChange(e, setSeed)} style={inputStyle} />
        <label style={labelStyle}>Strength:</label>
        <input type="number" value={strength.toString()} onChange={(e) => handleInputChange(e, setStrength)} style={inputStyle} />
        <label style={labelStyle}>Guidance Scale:</label>
        <input type="number" value={guidanceScale.toString()} onChange={(e) => handleInputChange(e, setGuidanceScale)} style={inputStyle} />
        <label style={labelStyle}>Num Inference Steps:</label>
          <input
            type="number"
            value={numInferenceSteps.toString()}
            onChange={(e) => handleInputChange(e, setNumInferenceSteps)}
            style={inputStyle}
          />
        <button onClick={handleCloseInput} style={closeButtonStyle}>X</button>
      </div>
    )}
  </div>
);
};

export default EditValueButton;