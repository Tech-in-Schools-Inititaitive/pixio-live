import React, { createContext, useState, Dispatch, SetStateAction } from 'react';

type PromptContextType = {
  promptText: string;
  setPromptText: Dispatch<SetStateAction<string>>;
  strength: number;
  setStrength: Dispatch<SetStateAction<number>>;
  guidanceScale: number;
  setGuidanceScale: Dispatch<SetStateAction<number>>;
  seed: number; // Add seed here
  setSeed: Dispatch<SetStateAction<number>>; // And its setter
  imageDataUri: string;
  setImageDataUri: Dispatch<SetStateAction<string>>;
  numInferenceSteps: number;
  setNumInferenceSteps: Dispatch<SetStateAction<number>>;
};

const defaultState: PromptContextType = {
  promptText: "a painting that looks amazing",
  setPromptText: () => {},
  strength: 0.7,
  setStrength: () => {},
  guidanceScale: 1.0,
  setGuidanceScale: () => {},
  seed: 42, // Default seed value
  setSeed: () => {},
  imageDataUri: '',
  setImageDataUri: () => {},
  numInferenceSteps: 1, // Set default value to 1
  setNumInferenceSteps: () => {}
  
};

export const PromptContext = createContext<PromptContextType>(defaultState);


interface PromptProviderProps {
  children: React.ReactNode;
}

export const PromptProvider: React.FC<PromptProviderProps> = ({ children }) => {
  const [promptText, setPromptText] = useState<string>("a painting that looks amazing");
  const [strength, setStrength] = useState<number>(0.7);
  const [guidanceScale, setGuidanceScale] = useState<number>(1.0);
  const [imageDataUri, setImageDataUri] = useState<string>('');
  const [seed, setSeed] = useState<number>(42); // Include state for seed
  const [numInferenceSteps, setNumInferenceSteps] = useState<number>(defaultState.numInferenceSteps);


  return (
    <PromptContext.Provider value={{
      promptText,
      setPromptText,
      strength,
      setStrength,
      guidanceScale,
      setGuidanceScale,
      seed,
      setSeed,
      imageDataUri,
      setImageDataUri,
      numInferenceSteps,
      setNumInferenceSteps,
    }}>
      {children}
    </PromptContext.Provider>
  );
};