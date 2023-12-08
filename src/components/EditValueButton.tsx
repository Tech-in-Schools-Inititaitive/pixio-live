import React, { useState, useContext, ChangeEvent, Dispatch, SetStateAction } from 'react';
import { PromptContext } from './PromptContext';
import { AnimateImage } from './AnimateImage'; // Import the AnimateImage component
import { CSSProperties } from 'react';

const EditValueButton: React.FC = () => {
  const [showInput, setShowInput] = useState(false);
  const { strength, setStrength, guidanceScale, setGuidanceScale, seed, setSeed, imageDataUri, numInferenceSteps, setNumInferenceSteps } = useContext(PromptContext);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, setter: Dispatch<SetStateAction<number>>) => {
    const value = parseFloat(e.target.value);
    setter(isNaN(value) ? 1 : value);
  };

  const handleCloseInput = () => {
    setShowInput(false);
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
  const animateContainerStyle = {
    display: 'flex',
    justifyContent: 'flex-end', // Aligns children (Animate button) to the right
    width: '100%', // Takes full width of the parent container
    marginTop: '5px', // Optional spacing from the above elements
  };

  return (
  <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(120px)', zIndex: 1000 }}>
    <button onClick={() => setShowInput(!showInput)} style={buttonStyle}>Edit Value</button>
    <button onClick={downloadImage} style={buttonStyle}>Download Image</button>
    
    <div style={{ ...animateContainerStyle }}>
      <AnimateImage />
    </div>
    {showInput && (
      <div style={menuStyle}>
        <label style={labelStyle}>Seed:</label>
        <input type="number" value={seed.toString()} onChange={(e) => handleInputChange(e, setSeed)} style={inputStyle} />
        <div style={sliderContainerStyle}>
            <label style={labelStyle}>Strength (0 - 1): {strength.toFixed(1)}</label>
            <input type="range" min="0" max="1" step="0.1" value={strength.toString()} onChange={(e) => handleInputChange(e, setStrength)} style={inputStyle} />
          </div>

          <div style={sliderContainerStyle}>
            <label style={labelStyle}>Guidance Scale (0 - 2): {guidanceScale.toFixed(1)}</label>
            <input type="range" min="0" max="2" step="0.1" value={guidanceScale.toString()} onChange={(e) => handleInputChange(e, setGuidanceScale)} style={inputStyle} />
          </div>

          <div style={sliderContainerStyle}>
            <label style={labelStyle}>Num Inference Steps (1 - 12): {numInferenceSteps}</label>
            <input type="range" min="1" max="12" value={numInferenceSteps.toString()} onChange={(e) => handleInputChange(e, setNumInferenceSteps)} style={inputStyle} />
          </div>
          <button onClick={handleCloseInput} style={closeButtonStyle}>X</button>
        </div>
    )}
  </div>
);
};


const sliderContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginBottom: '15px'
};


export default EditValueButton;