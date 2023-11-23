import { useEffect, useState } from "react";
import UpdateTeamForm from "./UpdateTeamForm";
import DisplayTeam from "./DisplayTeam";

/**
 * Component to facilitate the updating of a team. Once the form has been submitted, the display will be visible.
 * 
 * @returns JSX component containing the UpdateTeamForm 
 */
function UpdateTeam({ setDisplay }) {
    const [updatedTeam, setUpdatedTeam] = useState(null);

    useEffect(() => {
        if(updatedTeam) {
            const heading = `Updated ${updatedTeam.originalName} to:`;
            setDisplay(<DisplayTeam team={updatedTeam} heading={heading}/>);
        }
    }, [updatedTeam, setDisplay]);

    return (
        <UpdateTeamForm setUpdatedTeam={setUpdatedTeam}/>
    );
}

export default UpdateTeam;