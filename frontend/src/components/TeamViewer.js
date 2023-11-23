import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material";
import Select from "@mui/material/Select";
import Label from "@mui/material/InputLabel"
import { useState } from "react";

/**
 * General view of the teams statistics, including names, sport and country of origin
 * Micro component of the general viewer 
 * @param {*} teams
 * @param {*} setSelectedTeam
 * @returns JSX containing a box with a list of teams as specified by the ones passed.
 */
function TeamViewer({teams, setSelectedTeam}) {
    const [selected, setSelected] = useState(null);

    const theme = createTheme({
        palette: {
            background: {
                main: '#ccc'
            }
        }
    });

    const listClickEvent = (team) => {
        if(selected === team._id) {
            setSelected(null);
            setSelectedTeam(null);
        } else {
            setSelected(team._id);
            setSelectedTeam(team);
        }
    };

    const teamsItems  = teams.map((team) => (
        <ListItemButton key={team._id} onClick={() => {listClickEvent(team)}} selected={selected === team._id}>
            {team.name}
        </ListItemButton>
    ));

    return (
        <ThemeProvider theme={theme}>
            <h2>Team Filter</h2>
            <Box sx={{ bgcolor: "background.main"}} width="200px" height="250px">
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.black', maxHeight: 200 }}>
                    {teamsItems}
                </List>
            </Box>
        </ThemeProvider>
    );
}

export default TeamViewer;