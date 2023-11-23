import { Box } from "@mui/material";

/**
 * General view of the player statistics, including names, team, age and points
 * Micro component of the general viewer 
 * @param {*} players 
 * @returns JSX component that has a formated view of the players information
 */
function PlayerViewer({players}) {
    const boxes = players.map((player) => {
        return (<Box key={player._id} sx={{bgcolor: "#ccc"}} padding="2px" marginBottom="2px">
            <h5>{player.name}</h5>
            <h6>Age: {player.age}</h6>
            <h6>Points: {player.points}</h6>
        </Box>);
    });
    return (
        <>
            <h2>Roster</h2>
            {boxes}
        </>
    );
}

export default PlayerViewer;