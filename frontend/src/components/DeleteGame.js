import { useEffect, useState } from "react";
import DeleteGameForm from "./DeleteGameForm";

/**
 * Component that has as form to specify the game to delete and a display.
 * 
 * @returns A JSX component containing a DeleteGameForm
 */
function DeleteGame({ setDisplay }) {
    const [deletedGame, setDeletedGame] = useState(null);

    useEffect(() => {
        if(deletedGame) {
            setDisplay(<h1>Successfully deleted {deletedGame.team}</h1>);
        }
    }, [deletedGame, setDisplay]);

    return (
        <DeleteGameForm setDeletedGame={setDeletedGame}/>
    );
}

export default DeleteGame;