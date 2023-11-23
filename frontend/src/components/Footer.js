import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import './Footer.css';

/**
 * Footer locked to the bottom of the screen that has a copyright notice and some social media icons for aesthetics.
 * 
 * @returns JSX with footer, copyright and some social icons.
 */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        &copy; 2023 ATHLETIC METRICS
      </div>
      <div className="footer-right">
        <a href="#">
          <FaFacebook className="social-icon" />
        </a>
        <a href="#">
          <FaInstagram className="social-icon" />
        </a>
        <a href="#">
          <FaTwitter className="social-icon" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;