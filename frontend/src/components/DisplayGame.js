import { useState } from "react";

/**
 * Component to display a single game with name, sport, and country of origin.
 * 
 * @param {*} game to display to the user
 * @param {*} heading heading to place above the game
 * @returns JSX component containing proper headings to display a game.
 */
function DisplayGame({game, heading}) {
    return (
        <>
            <h1>{heading}</h1>
            <h2>{game.date}</h2>
            <h3>Winning Team: {game.winningTeam}</h3>
            <h3>Losing Team: {game.losingTeam}</h3>
            <h3>Rating: {game.rating}</h3>
        </>
    );
}

export default DisplayGame;