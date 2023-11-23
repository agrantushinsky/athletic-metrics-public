import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Component that lets the user enter the team name, 
 * 
 * @param {function} setAddedTeam callback function to set the addedTeam
 * @returns JSX containing form with inputs and submit button
 */
function AddTeamForm({setAddedTeam}) {
    const [name, setName] = useState(null);
    const [sport, setSport] = useState(null);
    const [countryOfOrigin, setCountryOfOrigin] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "POST",
            credentials: "include",
            body: JSON.stringify({
                name: name,
                sport: sport,
                countryOfOrigin: countryOfOrigin
            }),
            headers: {
                "Content-Type": "application/json; charset=UTF-8"
            }
        }

        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + "/teams/", requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setAddedTeam(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required/><br/>
            <Input type="text" placeholder="Sport" onChange={(e) => setSport(e.target.value)} required/><br/>
            <Input type="text" placeholder="Country of origin" onChange={(e) => setCountryOfOrigin(e.target.value)} required/><br/>
            {name && sport && countryOfOrigin && <Button type="submit" variant="contained" color="success">Add team</Button>}
        </form>
    );
}

export default AddTeamForm;