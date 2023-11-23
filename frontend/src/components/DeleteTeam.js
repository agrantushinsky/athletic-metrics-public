import { useEffect, useState } from "react";
import DeleteTeamForm from "./DeleteTeamForm";

/**
 * Component that has as form to specify the team to delete and a display.
 * 
 * @returns A JSX component containing a DeleteTeamForm
 */
function DeleteTeam({ setDisplay }) {
    const [deletedTeam, setDeletedTeam] = useState(null);

    useEffect(() => {
        if(deletedTeam) {
            setDisplay(<h1>Successfully deleted {deletedTeam.name}</h1>);
        }
    }, [deletedTeam, setDisplay]);

    return (
        <DeleteTeamForm setDeletedTeam={setDeletedTeam}/>
    );
}

export default DeleteTeam;