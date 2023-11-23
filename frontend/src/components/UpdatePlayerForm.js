import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Form to update a player using the original name to the new name, new is team based and new country of origin provided by input fields. The updated player will be sent back using the setUpdatedplayer setter.
 * 
 * @param {*} setUpdatedplayer setter for the updated player.
 * @returns JSX component containing input fields and a submit button.
 */
function UpdatePlayerForm({setUpdatedPlayer}) {
    const [originalName, setOriginalName] = useState(null);
    const [name, setName] = useState(null);
    const [age, setAge] = useState(null);
    const [points, setPoints] = useState(null);
    const [team, setTeam] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({
                originalName: originalName,
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
                setUpdatedPlayer(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Original name" onChange={(e) => setOriginalName(e.target.value)} required/><br/>
            <br></br>
            <Input type="text" placeholder="New name" onChange={(e) => setName(e.target.value)} required/><br/>
            <Input type="number" placeholder="New age: 0-100" onChange={(e) => setAge(e.target.value)} required/><br/>
            <Input type="number" placeholder="New points: 0-100" onChange={(e) => setPoints(e.target.value)} required/><br/>
            <Input type="text" placeholder="New team name" onChange={(e) => setTeam(e.target.value)} required/><br/>
            {originalName && name && age && points && team && <Button type="submit" variant="contained" color="success">Update player</Button>}
        </form>
    );
}

export default UpdatePlayerForm;