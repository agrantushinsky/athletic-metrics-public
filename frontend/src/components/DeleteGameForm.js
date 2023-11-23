import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Component to specify a game to be deleted, calls delete on the backend on submit. The deleted game will be sent back using the setDeletedGame setter.
 * 
 * @param {*} setDeletedgame setter for the deleted game
 * @returns JSX component containing an input and a button to submit.
 */
function DeleteGameForm({setDeletedGame}) {
    const [team, setTeam] = useState(null);
    const [date, setDate] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }

        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + `/games/${date}/${team}`, requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setDeletedGame(result);
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

export default DeleteGameForm;