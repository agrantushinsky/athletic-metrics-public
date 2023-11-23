import { useEffect, useState } from "react";
import DisplayTeam from "./DisplayTeam";
import SingleTeamForm from "./SingleTeamForm";

/**
 * Component that gets a single team from the form and display it once the form has been submitted.
 * 
 * @returns JSX component containing the form to specify the team to get 
 */
function SingleTeam({ setDisplay }) {
    const [team, setTeam] = useState(null);

    useEffect(() => {
        if(team) {
            setDisplay(<DisplayTeam team={team} heading="Found single team:"/>);
        }
    }, [team, setDisplay]);

    return (
        <SingleTeamForm setTeam={setTeam}/>
    );
}

export default SingleTeam;