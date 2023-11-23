import { useEffect, useState } from "react";
import AddGameForm from "./AddGameForms";
import DisplayGame from "./DisplayGame";

/**
 * Component that lets the user add a sport in a controlled form, then it calls the backend
 * to add the sport.
 * 
 * @returns JSX containing the form
 */
function AddGame({ setDisplay }) {
    const [addedGame, setAddedGame] = useState(null);

    useEffect(() => {
        if(addedGame) {
            setDisplay(<DisplayGame game={addedGame} heading="Successfully added:"/>);
        }
    }, [addedGame, setDisplay]);

    return (
        <AddGameForm setAddedGame={setAddedGame}/>
    );
}

export default AddGame;