import React, { useState, useContext, ChangeEvent, KeyboardEvent } from 'react';
import { PromptContext } from '../PromptContext';

const EditValueButton: React.FC = () => {
  const [showInput, setShowInput] = useState(false);
  const { strength, setStrength, guidanceScale, setGuidanceScale, seed, setSeed, imageDataUri } = useContext(PromptContext);

  const [strengthInput, setStrengthInput] = useState(strength.toString());
  const [guidanceScaleInput, setGuidanceScaleInput] = useState(guidanceScale.toString());
  const [seedInput, setSeedInput] = useState(seed.toString());

  const handleInputChange = (setter: (value: string) => void, e: ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const newStrength = parseFloat(strengthInput);
      const newGuidanceScale = parseFloat(guidanceScaleInput);
      let newSeed = parseInt(seedInput, 10);

      // Ensure newSeed is not NaN. If it is, keep the existing seed value.
      if (isNaN(newSeed)) {
        newSeed = seed;
      }

      if (!isNaN(newStrength)) {
        setStrength(newStrength);
      }

      if (!isNaN(newGuidanceScale)) {
        setGuidanceScale(newGuidanceScale);
      }

      setSeed(newSeed);

      setShowInput(false);
    }
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

  const inputStyle = {
    marginLeft: '10px',
    padding: '10px',
    width: '150px',
    border: '2px solid #4CAF50',
    borderRadius: '5px',
  };

  return (
    <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(120px)', zIndex: 1000 }}>
      <button onClick={() => setShowInput(true)} style={buttonStyle}>Edit Value</button>
      <button onClick={downloadImage} style={buttonStyle}>Download Image</button>

      {showInput && (
        <div style={{ marginTop: '10px' }}>
          <label>Seed:</label>
          <input type="number" value={seedInput} onChange={(e) => handleInputChange(setSeedInput, e)} onKeyPress={handleKeyPress} placeholder="Seed" style={inputStyle} />
          <label>Strength:</label>
          <input type="number" value={strengthInput} onChange={(e) => handleInputChange(setStrengthInput, e)} onKeyPress={handleKeyPress} placeholder="Strength" style={inputStyle} />
          <label>Guidance Scale:</label>
          <input type="number" value={guidanceScaleInput} onChange={(e) => handleInputChange(setGuidanceScaleInput, e)} onKeyPress={handleKeyPress} placeholder="Guidance Scale" style={inputStyle} />
          <button onClick={() => setShowInput(false)} style={buttonStyle}>X</button>
        </div>
      )}
    </div>
  );
};

export default EditValueButton;