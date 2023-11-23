import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

/**
 * Contains the general viewer that stores information related to the games, including winning team, losing teams, and ratings.
 * Micro component of the general viewer 
 * 
 * @param {*} games 
 * @returns JSX component that has a formated view of the games information
 */
function GameViewer({games}) {
    const rows = games.map(game => (
        <TableRow key={game._id}>
        <TableCell component="th" scope="row">
            {game.date}
        </TableCell>
              <TableCell>{game.winningTeam}</TableCell>
              <TableCell>{game.losingTeam}</TableCell>
              <TableCell>{game.rating}</TableCell>
        </TableRow>
    ));
    return (
        <>
        <h2>Games</h2>
        <TableContainer>
            <Table width="500px" sx={{bgcolor: "#ccc"}}>
                <TableHead>
                    <TableRow>
                        <TableCell><b>Date</b></TableCell>
                        <TableCell><b>Winning Team</b></TableCell>
                        <TableCell><b>Losing Team</b></TableCell>
                        <TableCell><b>Rating</b></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows}
                </TableBody>
            </Table>
        </TableContainer>
        </>
    );
}

export default GameViewer;