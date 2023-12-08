"use client";

import { LiveImageShapeUtil } from "@/components/live-image";
import * as fal from "@fal-ai/serverless-client";
import { Editor, FrameShapeTool, Tldraw, useEditor } from "@tldraw/tldraw";
import { useCallback } from "react";
import { LiveImageTool, MakeLiveButton } from "../components/LiveImageTool";
import { PromptProvider, PromptContext } from '../components/PromptContext';
import React, { useState, useContext } from 'react';
import { CSSProperties } from 'react';
// import EditPromptButton from '../components/EditPromptButton';
import EditValueButton from '../components/EditValueButton';

fal.config({
  requestMiddleware: fal.withProxy({
    targetUrl: "/api/fal/proxy",
  }),
});

const EditPromptButton: React.FC = () => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setPromptText } = useContext(PromptContext);

  const handleButtonClick = () => {
    setShowInput(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setPromptText(newValue); // Update context state as well
  };

  const handleCloseInput = () => {
    setShowInput(false);
  };

 // Use CSSProperties for accurate typing of style objects
 const containerStyle: CSSProperties = {
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
  
};

const buttonStyle: CSSProperties = {
  padding: '10px 20px',
  fontSize: '16px',
  background: '#4CAF50',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  marginBottom: '10px'
};

const inputStyle: CSSProperties = {
  padding: '10px',
  width: '300px',
  border: '2px solid #4CAF50',
  borderRadius: '5px',
  marginBottom: '10px',
  backgroundColor: '#FFFFFF' // Adding white background
};

return (
  <div style={containerStyle}>
    <button onClick={handleButtonClick} style={buttonStyle}>Edit Prompt</button>
    {showInput && (
      <>
        <label htmlFor="promptInput">Prompt Text:</label>
        <textarea
          id="promptInput"
          value={inputValue}
          onChange={handleTextChange}
          style={inputStyle}
        />
        <button onClick={handleCloseInput} style={{ ...buttonStyle, background: '#f44336' }}>X</button>
      </>
    )}
  </div>
);
};



const shapeUtils = [LiveImageShapeUtil];
const tools = [LiveImageTool];

export default function Home() {
  const onEditorMount = (editor: Editor) => {
    // If there isn't a live image shape, create one
    const liveImage = editor.getCurrentPageShapes().find((shape) => {
      return shape.type === "live-image";
    });

    if (liveImage) {
      return;
    }

    editor.createShape({
      type: "live-image",
      x: 120,
      y: 180,
      props: {
        w: 512,
        h: 512,
        name: "a painting that looks amazing",
      },
    });
  };
  return (
    <PromptProvider>
      <main className="flex min-h-screen flex-col items-center justify-between">
        <div className="fixed inset-0">
          <Tldraw
            persistenceKey="tldraw-fal"
            onMount={onEditorMount}
            shapeUtils={shapeUtils}
            tools={tools}
            shareZone={<MakeLiveButton />}
          />
          <EditPromptButton />
          <EditValueButton /> {/* Positioned as per the new styling */}
        </div>
      </main>
    </PromptProvider>
  );
}
