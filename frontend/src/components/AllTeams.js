import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListTeams from "./ListTeams";
import Button from "@mui/material/Button";

/**
 * Component containing a button to get all teams and a list for all teams.
 * The list will only be visible once the button has been pressed.
 * 
 * @returns JSX containing a button 
 */
function AllTeams({ setDisplay }) {
    const [teams, setTeams] = useState(null);

    useEffect(() => {
        if(teams) {
            setDisplay(<ListTeams teams={teams}/>);
        }
    }, [teams, setDisplay]);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        try {
            const response = await fetch(process.env.REACT_APP_BACKEND + "/teams/get-all", { method: "GET" });
            const result = await response.json();

            if(response.status === 500 || response.status === 401) {
                navigate("/adminpanel", {state: { errorMessage: result.errorMessage}});
                setTeams(null);
                return;
            }

            setTeams(result);
        } catch {
            navigate("/systemerror", {state: { errorMessage: "Connection to backend failed."}});
        }
    };

    return (
        <Button variant="contained" onClick={() => {handleSubmit()}}>Get all Teams</Button>
    )
}

export default AllTeams;