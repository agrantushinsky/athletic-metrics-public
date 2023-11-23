import { useEffect, useState } from "react";
import UpdateGameForm from "./UpdateGameForm";
import DisplayGame from "./DisplayGame";

/**
 * Component to facilitate the updating of a game. Once the form has been submitted, the display will be visible.
 * 
 * @returns JSX component containing the UpdateGameForm 
 */
function UpdateGame({setDisplay}) {
    const [updatedGame, setUpdatedGame] = useState(null);

    useEffect(() => {
        if(updatedGame) {
            const heading = `Updated ${updatedGame.originalName} to:`;
            setDisplay(<DisplayGame game={updatedGame} heading={heading}/>);
        }
    }, [updatedGame, setDisplay]);

    return (
        <UpdateGameForm setUpdatedGame={setUpdatedGame}/>
    );
}

export default UpdateGame;