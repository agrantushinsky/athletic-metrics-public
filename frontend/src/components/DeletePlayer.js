import { useEffect, useState } from "react";
import DeletePlayerForm from "./DeletePlayerForm";

/**
 * Component that has as form to specify the player to delete and a display.
 * 
 * @returns A JSX component containing a DeletePlayerForm
 */
function DeletePlayer({setDisplay}) {
    const [deletedPlayer, setDeletedPlayer] = useState(null);

    useEffect(() => {
        if(deletedPlayer) {
            setDisplay(<h1>Successfully deleted {deletedPlayer.name}</h1>);
        }
    }, [deletedPlayer, setDisplay]);

    return (
        <DeletePlayerForm setDeletedPlayer={setDeletedPlayer}/>
    );
}

export default DeletePlayer;