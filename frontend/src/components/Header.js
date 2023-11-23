import React from 'react';
import logo from '../images/logo.png'; // import the logo image
import './Navbar.css';
import NavWrapper from './NavWrapper';
import { LoggedInContext, AdministratorContext } from "./App";
import { useContext } from "react";
import LogoutButton from "./LogoutButton";
import NavButton from "./NavButton";
import Button from "@mui/material/Button";
import "./Header.css";

/**
 * Contains the general header being used for the website, includes a project logo to identify by
 * 
 * @returns JSX component that contains the general header being used for the website
 */
function Header() {
  const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);
  const [isAdministrator, setIsAdministrator] = useContext(AdministratorContext);
  return (
    <nav className="navbar">
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavWrapper to="/">
            <img src={logo} alt="Logo" />
          </NavWrapper>
        </li>
      </ul>
      <ul className="navbar-nav">
      <li className="nav-item">
        {isAdministrator && <NavWrapper to="/adminpanel">
          <Button variant="contained">Admin Panel</Button>
          </NavWrapper>}

        {isLoggedIn ? <LogoutButton/> : <NavWrapper to="/login">
          <Button variant="contained">Login</Button>
          </NavWrapper>} 
          </li>
      </ul>
    </nav>
  );
}

export default Header;