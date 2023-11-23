import { useState } from "react";
import Games from "./Games";
import Players from "./Players";
import Teams from "./Teams";
import Button from '@mui/material/Button'

/**
 * Contains an adminstrator view of games, teams, and players. Allows them to navigate each and perform CRUD operations
 * 
 * @returns JSX component that contains 3 properties that hold statistics, including teams, games and players
 */
function PanelSwitcher() {
    const menuItem1 = <Players/>
    const menuItem2 = <Games/>
    const menuItem3 = <Teams/>

    const [display, setDisplay] = useState(menuItem1);

    return (
        <>
            <div className="d-flex justify-content-center flex-row">
                <Button variant="contained" onClick={() => setDisplay(menuItem1)}>
                    Players
                </Button>
                <p />
                <Button variant="contained" onClick={() => setDisplay(menuItem2)}>
                    Games
                </Button>
                <p />
                <Button variant="contained" onClick={() => setDisplay(menuItem3)}>
                    Teams
                </Button>
            </div>
            {display}
        </>
    );
}

export default PanelSwitcher;