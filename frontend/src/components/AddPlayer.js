import { useEffect, useState } from "react";
import AddPlayerForm from "./AddPlayerForm";
import DisplayPlayer from "./DisplayPlayer";

/**
 * Component that lets the user add a sport in a controlled form, then it calls the backend
 * to add the sport.
 * 
 * @returns JSX containing the form
 */
function AddPlayer({ setDisplay }) {
    const [addedPlayer, setAddedPlayer] = useState(null);

    useEffect(() => {
        if(addedPlayer) {
            setDisplay(<DisplayPlayer player={addedPlayer} heading="Successfully added:"/>);
        }
    }, [addedPlayer, setDisplay]);

    return (
        <AddPlayerForm setAddedPlayer={setAddedPlayer}/>
    );
}

export default AddPlayer;