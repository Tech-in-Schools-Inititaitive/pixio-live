// app/components/PromptContext.tsx
import React, { createContext, useState, Dispatch, SetStateAction } from 'react';

type PromptContextType = {
  promptText: string;
  setPromptText: Dispatch<SetStateAction<string>>;
};

const defaultState: PromptContextType = {
  promptText: "a painting that looks amazing",
  setPromptText: () => {}
};

export const PromptContext = createContext<PromptContextType>(defaultState);

// Define the type for the component props
interface PromptProviderProps {
  children: React.ReactNode;
}

export const PromptProvider: React.FC<PromptProviderProps> = ({ children }) => {
  const [promptText, setPromptText] = useState<string>("a painting that looks amazing");

  return (
    <PromptContext.Provider value={{ promptText, setPromptText }}>
      {children}
    </PromptContext.Provider>
  );
};
