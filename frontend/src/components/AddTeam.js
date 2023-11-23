import { useEffect, useState } from "react";
import DisplayTeam from "./DisplayTeam";
import AddTeamForm from "./AddTeamForm";

/**
 * Component that lets the user add a team in a controlled form, then it calls the backend
 * to add the team.
 * 
 * @returns JSX containing the form
 */
function AddTeam({ setDisplay }) {
    const [addedTeam, setAddedTeam] = useState(null);

    useEffect(() => {
        if(addedTeam) {
            setDisplay(<DisplayTeam team={addedTeam} heading="Successfully added:"/>);
        }
    }, [addedTeam, setDisplay]);

    return (
        <AddTeamForm setAddedTeam={setAddedTeam}/>
    );
}

export default AddTeam;