import { useEffect, useState } from "react";
import DisplayPlayer from "./DisplayPlayer";
import SinglePlayerForm from "./SinglePlayerForm";

/**
 * Component that gets a single player from the form and display it once the form has been submitted.
 * 
 * @returns JSX component containing the form to specify the player to get 
 */
function SinglePlayer({ setDisplay }) {
    const [player, setPlayer] = useState(null);

    useEffect(() => {
        if(player) {
            setDisplay(<DisplayPlayer player={player} heading="Found single player:"/>);
        }
    }, [player, setDisplay]);

    return (
        <SinglePlayerForm setPlayer={setPlayer}/>
    );
}

export default SinglePlayer;