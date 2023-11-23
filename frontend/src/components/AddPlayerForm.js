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
function AddPlayerForm({setAddedPlayer}) {
    const [name, setName] = useState(null);
    const [age, setAge] = useState(null);
    const [points, setPoints] = useState(null);
    const [team, setTeam] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                name: name,
                age: age,
                points: points,
                team: team
            }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }

        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + "/players/", requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setAddedPlayer(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required/><br/>
            <Input type="number" placeholder="Age: 0-100" onChange={(e) => setAge(e.target.value)} required/><br/>
            <Input type="number" placeholder="Points: 0-100" onChange={(e) => setPoints(e.target.value)} required/><br/>
            <Input type="text" placeholder="Team Name" onChange={(e) => setTeam(e.target.value)} required/><br/>
            {name && age && team && points && <Button type="submit" variant="contained" color="success">Add Player</Button>}
        </form>
    );
}

export default AddPlayerForm;