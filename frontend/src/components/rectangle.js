import React from 'react';
import './Rectangle.css';

/**
 * Contains a rectangle with text to display application features on the home page
 * 
 * @param {*} text
 * @returns JSX component that contains a rectangle with text
 */
const Rectangle = ({ text }) => {
  return (
    <div className="rectangle">
      <p>{text}</p>
    </div>
  );
};

export default Rectangle;