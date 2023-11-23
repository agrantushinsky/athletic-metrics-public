import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Component containing a form to specify a player to retrieve from the backend and sets it using the setPlayer setter.
 * 
 * @param {*} setplayer setter for the player retrieved 
 * @returns JSX component containing an input field a button to submit.
 */
function SingleGameForm({setGame}) {
    const [team, setTeam] = useState(null);
    const [date, setDate] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "GET",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }

        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + `/games/${team}/${date}`, requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setGame(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Team Name" onChange={(e) => setTeam(e.target.value)} required/><br/>
            <Input type="text" placeholder="Date: YYYY-MM-DD" onChange={(e) => setDate(e.target.value)} required/><br/>
            {team && date && <Button type="submit" variant="contained" color="success">Get Game</Button>}
        </form>
    );
}

export default SingleGameForm;