import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListPlayers from "./ListPlayers";
import Button from "@mui/material/Button";

/**
 * Component containing a button to get all players and a list for all players.
 * The list will only be visible once the button has been pressed.
 * 
 * @returns JSX containing a button 
 */
function AllPlayers({setDisplay}) {
    const [players, setPlayers] = useState(null);

    useEffect(() => {
        if(players) {
            setDisplay(<ListPlayers players={players}/>);
        }
    }, [players, setDisplay]);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + "/players/get-all", { method: "GET" });
            const result = await response.json();

            if(response.status === 500 || response.status === 401) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
                setPlayers(null);
                return;
            }

            setPlayers(result);
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <Button variant="contained" onClick={() => {handleSubmit()}}>Get all players</Button>
    )
}

export default AllPlayers;