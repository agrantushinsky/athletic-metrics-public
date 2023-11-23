import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Component that lets the user enter the sport name, true or false for is team based and it's country of origin in a form and calls the callback to
 * change the addedSport after adding to database using backend. Uses a controlled form.
 * 
 * @param {function} setAddedPlayer callback function to set the addedSport
 * @returns JSX containing form with inputs and submit button
 */
function AddGameForm({setAddedGame}) {
    const [date, setDate] = useState(null);
    const [winningTeam, setWT] = useState(null);
    const [losingTeam, setLT] = useState(null);
    const [rating, setRating] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                date: date,
                winningTeam: winningTeam,
                losingTeam: losingTeam,
                rating: rating,
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
                setAddedGame(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Date: YYYY-MM-DD" onChange={(e) => setDate(e.target.value)} required/><br/>
            <Input type="text" placeholder="Winning Team" onChange={(e) => setWT(e.target.value)} required/><br/>
            <Input type="text" placeholder="Losing Team" onChange={(e) => setLT(e.target.value)} required/><br/>
            <Input type="number" placeholder="Rating: 0-100" onChange={(e) => setRating(e.target.value)} required/><br/>
            {date && winningTeam && losingTeam && rating && <Button type="submit" variant="contained" color="success">Add Game</Button>}
        </form>
    );
}

export default AddGameForm;