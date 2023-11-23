import { useState } from "react";

/**
 * Component to display a single team with name, sport, and country of origin.
 * 
 * @param {*} team to display to the user
 * @param {*} heading heading to place above the team
 * @returns JSX component containing proper headings to display a team.
 */
function DisplayTeam({team, heading}) {
    return (
        <>
            <h1>{heading}</h1>
            <h2>{team.name}</h2>
            <h3>Sport: {team.sport}</h3>
            <h3>Country of Origin: {team.countryOfOrigin}</h3>
        </>
    );
}

export default DisplayTeam;