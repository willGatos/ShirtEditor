import { useState } from 'react';

export const useTextOverlay = (initialText = '') => {
  const [text, setText] = useState(initialText);
  const [textColor, setTextColor] = useState('#000000');
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });
  const [textSize, setTextSize] = useState({ width: 20, height: 10 });
  const [textRotation, setTextRotation] = useState(0);

  const handleTextDrag = (x: number, y: number) => {
    setTextPos({ x, y });
  };

  return {
    text, setText,
    textColor, setTextColor,
    textPos, handleTextDrag,
    textSize, setTextSize,
    textRotation, setTextRotation,
  };
};