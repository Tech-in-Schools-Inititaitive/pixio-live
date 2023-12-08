import React, { useState, useContext,CSSProperties } from 'react';
import { PromptContext } from './PromptContext';
import * as fal from "@fal-ai/serverless-client";


interface FalAnimationResult {
  image: {
    url: string;
    // Add other properties as needed
  };
  // Add other response properties as needed
}

export const AnimateImage: React.FC = () => {
  const { imageDataUri, seed } = useContext(PromptContext);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatedImage, setAnimatedImage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const downloadAnimatedImage = () => {
    if (animatedImage) {
      // Convert data URI to Blob
      fetch(animatedImage)
        .then(res => res.blob())
        .then(blob => {
          // Create a link and set the URL as the object URL for the blob
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = 'animatedImage.gif'; // Set the default filename for the download
          document.body.appendChild(link); // Append the link to the document
          link.click(); // Programmatically click the link to trigger the download
          document.body.removeChild(link); // Remove the link from the document
          window.URL.revokeObjectURL(blobUrl); // Clean up the object URL
        })
        .catch(console.error);
    }
  };
  

  const animateImage = async () => {
    if (!imageDataUri) {
      console.error('No image data URI available for animation');
      return;
    }

    setIsAnimating(true);
    try {
      console.log('Sending request:', { imageDataUri, seed });
      const result = await fal.subscribe("110602490-svd", {
        input: {
          image_url: imageDataUri,
          seed: seed,
        },
        logs: true,
      }) as FalAnimationResult;

      console.log('Received response:', result);
      setAnimatedImage(result.image.url);
      setShowPopup(true);
    } catch (error) {
      console.error('Error animating image:', error);
    }
    setIsAnimating(false);
  };
  
  return (
    <>
      <button onClick={animateImage} disabled={isAnimating} style={animateButtonStyle}>
        {isAnimating ? 'Animating...' : 'Animate Image'}
      </button>
      {showPopup && animatedImage && (
        <div style={popupStyle}>
          <img src={animatedImage} alt="Animated Image" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          <div style={buttonContainerStyle}>
            <button onClick={downloadAnimatedImage} style={downloadButtonStyle}>Download</button>
            <button onClick={() => setShowPopup(false)} style={closeButtonStyle}>X</button>
          </div>
        </div>
      )}
    </>
  );
};
const popupStyle: CSSProperties = {
  position: 'absolute',
  top: '250px', // Adjusted to move the popup down
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  zIndex: 1001,
  width: '80%', // Increased width
  height: 'auto', // Adjust height as needed
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};


const animateButtonStyle: CSSProperties = {
  padding: '10px 20px',
  fontSize: '16px',
  margin: '10px 0', // Added margin for spacing
  // Other styling as needed
  background: '#4CAF50', // Example background color
  color: 'white', // Example text color
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};
// Add styles for the new button and button container
const buttonContainerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '20px',
};
// Updated styles
const closeButtonStyle: CSSProperties = {
  backgroundColor: 'red',
  color: 'white',
  padding: '10px 15px', // Adjust padding to match height with download button
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  marginLeft: '5px', // Add small space between the buttons
};

const downloadButtonStyle: CSSProperties = {
  padding: '10px 15px', // Adjust padding to match height with close button
  backgroundColor: '#4CAF50',
  marginRight: '5px', // Add small space between the buttons
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  marginLeft: '10px',
};