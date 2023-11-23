import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Component to specify a player to be deleted, calls delete on the backend on submit. The deleted player will be sent back using the setDeletedPlayer setter.
 * 
 * @param {*} setDeletedplayer setter for the deleted player
 * @returns JSX component containing an input and a button to submit.
 */
function DeletePlayerForm({setDeletedPlayer}) {
    const [name, setName] = useState(null);

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
            const response = await fetch(process.env.REACT_APP_BACKEND + `/players/${name}`, requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500 || response.status === 401) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setDeletedPlayer(result);
            }
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required/><br/>
            {name && <Button type="submit" variant="contained" color="success">Delete player</Button>}
        </form>
    );
}

export default DeletePlayerForm;