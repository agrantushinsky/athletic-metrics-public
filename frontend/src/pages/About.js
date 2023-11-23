import "./About.css"

/**
 * About page with our website's mission.
 * 
 * @returns JSX component containing about us information in a paragraph.
 */
function About() {
    return (
        <div className="About">
            <p>Our mission with this project is to develop a centralised hub to store player statistics. Frequently, individual sports will have their respective websites for their stats, and as avid sports followers, it can get tedious to go from webpage to webpage. Therefore, our motivation is to develop a sleek, modern, accessible and straightforward interface, displaying heaps of information regarding goals scored, ages, names, teams and so on, for all mainstream sports. On our end, we want to dynamically add given information, update our ever-evolving sports statistics database, display said statistics, and delete statistics where we see fit.  </p>
        </div>
    );
}

export default About;