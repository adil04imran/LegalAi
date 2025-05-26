import React, { useEffect, useState } from 'react';
import './loader.css';

const messages = [
  'Collecting data from web...',
  'Generating initial hypothesis...',
  'Studying research papers...',
  'Preparing 2nd level reflected hypothesis...',
  'Ranking hypothesis...',
  'Generating final response...'
];

export default function Loader() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) =>
        prevIndex < messages.length - 1 ? prevIndex + 1 : prevIndex
      );
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loader">
      <p className="line">{messages[currentMessageIndex]}</p>
    </div>
  );
}