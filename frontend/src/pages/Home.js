import React from 'react';
import aboutus from "../images/aboutus.png"
import Rectangle from 'components/rectangle';
import './Home.css';
import NavSport from 'components/NavSports';

/**
 * General home page of the website that contains about us, and buttons to navigate to respective sports, as well as features
 * 
 * @returns JSX component containing home page displaying general information and gifs to navigate to sports
 */
function Home() {
  return (
    <div className="homeMessage">
      <NavSport></NavSport>
      <div className="sportLabels">
      <br></br>
        <h2>SOCCER</h2>
        <h2>BASKETBALL</h2>
        <h2>BASEBALL</h2>
        <h2>POWERLIFTING</h2>
        <h2>FOOTBALL</h2>
      <br></br>
      </div>
      <div className='aboutus-container'>
        <div class="aboutus-content">
          <h2>WHO ARE WE?</h2>
          <body id="aboutus-Message">
          We are <bolder>ATHLETIC METRICS</bolder>, and we are a sports statistics website, here to store your stats, in our state of the art application. 
          Our mission with this project is to develop a centralised hub to store player statistics. 
          Frequently, individual sports will have their respective websites for their stats, and as avid sports followers,
          it can get tedious to go from webpage to webpage. Therefore, we want to develop a sleek, modern, accessible and straightforward interface, displaying heaps of information regarding goals scored, ages, names, teams and so on, for all mainstream sports. 
          </body>         
        </div>
        <div class="aboutus-image">
          <img src={aboutus} alt="aboutus"/>
        </div>
      </div>
      <div className="featuresHeader">
        <h2>FEATURES</h2>  
          <div className="features"> 
            <Rectangle text={"VIEWING"}></Rectangle>
            <Rectangle text={"USER LOGIN"}></Rectangle>
            <Rectangle text={"FILTER AND QUERY"}></Rectangle>
            <Rectangle text={"TEAM STATS"}></Rectangle>
            <Rectangle text={"PLAYER STATS"}></Rectangle>
            <Rectangle text={"FEEDBACKS"}></Rectangle>
            <Rectangle text={"SOCIAL MEDIA"}></Rectangle>
            <Rectangle text={"GAME STATS"}></Rectangle>
            <Rectangle text={"MODERN UI"}></Rectangle>
          </div>   
      </div> 
    </div>
  );
}

export default Home;