import { useState } from 'react';

export const useTextOverlay = (initialText = '') => {
  const [text, setText] = useState(initialText);
  const [textColor, setTextColor] = useState('#000000');
  const [textPos, setTextPos] = useState({ x: 50, y: 50 });
  const [textSize, setTextSize] = useState({ width: 20, height: 10 });
  const [textRotation, setTextRotation] = useState(0);

  const handleTextDrag = (dx: number, dy: number) => {
    setTextPos((prev) => ({
      x: Math.min(Math.max(prev.x + dx, 0), 100),
      y: Math.min(Math.max(prev.y + dy, 0), 100),
    }));
  };

  return {
    text, setText,
    textColor, setTextColor,
    textPos, handleTextDrag,
    textSize, setTextSize,
    textRotation, setTextRotation,
  };
};