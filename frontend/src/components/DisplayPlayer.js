import { useState } from "react";

/**
 * Component to display a single player with name, age, points, and teams.
 * 
 * @param {*} player to display to the user
 * @param {*} heading heading to place above the player
 * @returns JSX component containing proper headings to display a player.
 */
function DisplayPlayer({player, heading}) {
    return (
        <>
            <h1>{heading}</h1>
            <h2>{player.name}</h2>
            <h3>Age: {player.age}</h3>
            <h3>Points: {player.points}</h3>
            <h3>Team: {player.team}</h3>
        </>
    );
}

export default DisplayPlayer;