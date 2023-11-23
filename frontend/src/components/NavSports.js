import React from 'react';// import the logo image
import NavWrapper from './NavWrapper';
import { LoggedInContext, AdministratorContext } from "./App";
import { useContext } from "react";
import "./NavSport.css";
import soccer from "../images/soccer.gif";
import basketball from "../images/basketball.gif";
import football from "../images/football.gif"
import baseball from "../images/baseball.gif";
import powerlift from "../images/powerlift.gif";

/**
 * General menu/catalogue of sports seen on the home page, Every sport contains a link to it's respective statistics page. Uses animated gifs to achieve this
 * 
 * @returns JSX copmonent with animated gifs of sports equipment that lead to respective statistics pages
 */
function NavSport() {
  const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);
  return (
    <nav className="navSport">
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavWrapper to="/soccer">
            <img id="soccerGif" src={soccer} alt="Logo"/>
          </NavWrapper>
        </li>
      </ul>
      <ul className="navbar-nav">
      <li className="nav-item">
          <NavWrapper to="/basketball">
            <img src={basketball} alt="Logo" />
          </NavWrapper>
        </li>
      </ul>
      <ul className="navbar-nav">
      <li className="nav-item">
          <NavWrapper to="/baseball">
            <img src={baseball} alt="Logo" />
          </NavWrapper>
        </li>
      </ul>
      <ul className="navbar-nav">
      <li className="nav-item">
          <NavWrapper to="/powerlift">
            <img src={powerlift} alt="Logo" />
          </NavWrapper>
        </li>
      </ul>
      <ul className="navbar-nav">
      <li className="nav-item">
          <NavWrapper to="/football">
            <img src={football} alt="Logo"/>
          </NavWrapper>
        </li>
      </ul>
    </nav>
  );
}

export default NavSport;