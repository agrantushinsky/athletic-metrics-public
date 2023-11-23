import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Component containing a form to specify a team to retrieve from the backend and sets it using the setTeam setter.
 * 
 * @param {*} setteam setter for the team retrieved 
 * @returns JSX component containing an input field a button to submit.
 */
function SingleTeamForm({setTeam}) {
    const [name, setName] = useState(null);

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
            const response = await fetch(process.env.REACT_APP_BACKEND + `/teams/${name}`, requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setTeam(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required/><br/>
            {name && <Button type="submit" variant="contained" color="success">Get team</Button>}
        </form>
    );
}

export default SingleTeamForm;