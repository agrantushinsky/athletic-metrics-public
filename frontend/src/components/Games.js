import Main from "components/Main";
import { useLocation } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import ErrorBoundary from "components/ErrorBoundary";

import AddGame from 'components/AddGame';
import SingleGame from 'components/SingleGame';
import AllGames from 'components/AllGames';
import UpdateGame from 'components/UpdateGame';
import DeleteGame from 'components/DeleteGame';

/**
 * Displays the games page with a ErrorBoundary with the main inside. If an error occurs, an alert will popup above the Main.
 * 
 * @returns JSX component containing the Main surrounded by an errorboundary. If an error occurred, a bootstrap alert will have the errorMessage.
 */
function Games() {
    const { state } = useLocation();

    return (
        <>
            <ErrorBoundary>
                {state && state.errorMessage && <Alert variant="danger">{state.errorMessage}</Alert>}
                <Main AddComponent={AddGame} GetComponent={SingleGame} GetAllComponent={AllGames} UpdateComponent={UpdateGame} DeleteComponent={DeleteGame}/>
            </ErrorBoundary>
        </>
    );
}

export default Games;