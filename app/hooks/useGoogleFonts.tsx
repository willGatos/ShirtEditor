import { useState, useEffect } from 'react';

interface GoogleFont {
  family: string;
  variants: string[];
  category: string;
}

export const useGoogleFonts = () => {
  const [googleFonts, setGoogleFonts] = useState<GoogleFont[]>([]);
  const [selectedGoogleFont, setSelectedGoogleFont] = useState<GoogleFont | null>(null);
  const [selectedVariant, setSelectedVariant] = useState('regular');

  useEffect(() => {
    fetchGoogleFonts();
  }, []);

  const fetchGoogleFonts = async () => {
    try {
      const response = await fetch('https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyCWBzWwu3OnEf9QqxHwSusBlhmq5tXZaA4');
      const data = await response.json();
      setGoogleFonts(data.items);
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
    }
  };

  useEffect(() => {
    if (selectedGoogleFont) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css?family=${selectedGoogleFont.family.replace(' ', '+')}:${selectedGoogleFont.variants.join(',')}`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [selectedGoogleFont]);

  return { googleFonts, selectedGoogleFont, setSelectedGoogleFont, selectedVariant, setSelectedVariant };
};
