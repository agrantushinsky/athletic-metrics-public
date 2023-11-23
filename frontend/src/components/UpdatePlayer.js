import { useEffect, useState } from "react";
import UpdatePlayerForm from "./UpdatePlayerForm";
import DisplayPlayer from "./DisplayPlayer";

/**
 * Component to facilitate the updating of a player. Once the form has been submitted, the display will be visible.
 * 
 * @returns JSX component containing the UpdatePlayerForm 
 */
function UpdatePlayer({setDisplay}) {
    const [updatedPlayer, setUpdatedPlayer] = useState(null);

    useEffect(() => {
        if(updatedPlayer) {
            const heading = `Updated ${updatedPlayer.originalName} to:`;
            setDisplay(<DisplayPlayer player={updatedPlayer} heading={heading}/>);
        }
    }, [updatedPlayer, setDisplay]);

    return (
        <UpdatePlayerForm setUpdatedPlayer={setUpdatedPlayer}/>
    );
}

export default UpdatePlayer;