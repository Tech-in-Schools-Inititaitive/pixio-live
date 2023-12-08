"use client";

import { LiveImageShapeUtil } from "@/components/live-image";
import * as fal from "@fal-ai/serverless-client";
import { Editor, FrameShapeTool, Tldraw, useEditor } from "@tldraw/tldraw";
import { useCallback } from "react";
import { LiveImageTool, MakeLiveButton } from "../LiveImageTool";
import { PromptProvider, PromptContext } from '../PromptContext';
import React, { useState, useContext } from 'react';

fal.config({
  requestMiddleware: fal.withProxy({
    targetUrl: "/api/fal/proxy",
  }),
});

const EditPromptButton: React.FC = () => {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { setPromptText } = useContext(PromptContext);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowInput(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setPromptText(inputValue);
      setShowInput(false);
    }
  };


  return (
    <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', zIndex: 1000 }}>
      <button onClick={handleButtonClick} style={{ padding: '10px 20px', fontSize: '16px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Edit Prompt
      </button>
      {showInput && (
        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your prompt here"
          style={{ marginLeft: '10px', padding: '10px', width: '300px', border: '2px solid #4CAF50', borderRadius: '5px' }}
        />
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
        <EditPromptButton /> {/* Added the EditPromptButton here */}
      </div>
    </main>
    </PromptProvider>
  );
}
