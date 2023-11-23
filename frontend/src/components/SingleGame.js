import { useEffect, useState } from "react";
import DisplayPlayer from "./DisplayPlayer";
import SingleGameForm from "./SingleGameForm";

/**
 * Component that gets a single player from the form and display it once the form has been submitted.
 * 
 * @returns JSX component containing the form to specify the player to get 
 */
function SingleGame({ setDisplay }) {
    const [game, setGame] = useState(null);

    useEffect(() => {
        if(game) {
            setDisplay(<DisplayPlayer game={game} heading="Found single game:"/>);
        }
    }, [game, setDisplay]);

    return (
        <SingleGameForm setGame={setGame}/>
    );
}

export default SingleGame;