import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Form to update a game using the original name to the new name, new is team based and new country of origin provided by input fields. The updated game will be sent back using the setUpdatedgame setter.
 * 
 * @param {*} setUpdatedgame setter for the updated game.
 * @returns JSX component containing input fields and a submit button.
 */
function UpdateGameForm({setUpdatedGame}) {
    const [targetDate, setTargetDate] = useState(null);
    const [targetTeam, setTargetTeam] = useState(null);

    const [date, setDate] = useState(null);
    const [winningTeam, setWT] = useState(null);
    const [losingTeam, setLT] = useState(null);
    const [rating, setRating] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({
                targetDate: targetDate,
                targetTeam: targetTeam,
                winningTeam: winningTeam,
                losingTeam: losingTeam,
                date: date,
                rating: rating
            }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }

        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + "/games/", requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setUpdatedGame(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Target Date: YYYY-MM-DD" onChange={(e) => setTargetDate(e.target.value)} required/><br/>
            <Input type="text" placeholder="Target Team" onChange={(e) => setTargetTeam(e.target.value)} required/><br/><br/>
            <Input type="text" placeholder="New Date: YYYY-MM-DD" onChange={(e) => setDate(e.target.value)} required/><br/>
            <Input type="number" placeholder="Rating: 0-100" onChange={(e) => setRating(e.target.value)} required/><br/>
            <Input type="text" placeholder="Winning Team" onChange={(e) => setWT(e.target.value)} required/><br/>
            <Input type="text" placeholder="Losing Team" onChange={(e) => setLT(e.target.value)} required/><br/>
            {targetDate && targetTeam && date && rating && winningTeam && losingTeam && <Button type="submit" variant="contained" color="success">Update game</Button>}
        </form>
    );
}

export default UpdateGameForm;