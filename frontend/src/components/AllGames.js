import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListGames from "./ListGames";
import Button from "@mui/material/Button";

/**
 * Component containing a button to get all games and a list for all games.
 * The list will only be visible once the button has been pressed.
 * 
 * @returns JSX containing a button 
 */
function AllGames({ setDisplay }) {
    const [games, setGames] = useState(null);

    useEffect(() => {
        if(games) {
            setDisplay(<ListGames games={games}/>);
        }
    }, [games, setDisplay]);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + "/games/get-all", { method: "GET" });
            const result = await response.json();

            if(response.status === 500 || response.status === 401) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
                setGames(null);
                return;
            }

            setGames(result);
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <Button variant="contained" onClick={() => {handleSubmit()}}>Get all Games</Button>
    )
}

export default AllGames;