import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Form to update a team using the original name to the new name, new is team based and new country of origin provided by input fields. The updated team will be sent back using the setUpdatedTeam setter.
 * 
 * @param {*} setUpdatedTeam setter for the updated team.
 * @returns JSX component containing input fields and a submit button.
 */
function UpdateTeamForm({setUpdatedTeam}) {
    const [originalName, setOriginalName] = useState(null);
    const [name, setName] = useState(null);
    const [sport, setSport] = useState(null);
    const [countryOfOrigin, setCountryOfOrigin] = useState(null);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const requestOptions = {
            method: "PUT",
            credentials: "include",
            body: JSON.stringify({
                originalName: originalName,
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
                setUpdatedTeam(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Original name" onChange={(e) => setOriginalName(e.target.value)} required/><br/>
            <Input type="text" placeholder="New name" onChange={(e) => setName(e.target.value)} required/><br/>
            <Input type="text" placeholder="New sport" onChange={(e) => setSport(e.target.value)} required/><br/>
            <Input type="text" placeholder="New country of origin" onChange={(e) => setCountryOfOrigin(e.target.value)} required/><br/>
            {originalName && name && sport && countryOfOrigin && <Button type="submit" variant="contained" color="success">Update Team</Button>}
        </form>
    );
}

export default UpdateTeamForm;