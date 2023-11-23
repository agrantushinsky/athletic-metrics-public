import Main from "components/Main";
import { useLocation } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import ErrorBoundary from "components/ErrorBoundary";

import AddPlayer from 'components/AddPlayer';
import SinglePlayer from 'components/SinglePlayer';
import AllPlayers from 'components/AllPlayers';
import UpdatePlayer from 'components/UpdatePlayer';
import DeletePlayer from 'components/DeletePlayer';

/**
 * Displays the players page with a ErrorBoundary with the main inside. If an error occurs, an alert will popup above the Main.
 * 
 * @returns JSX component containing the Main surrounded by an errorboundary. If an error occurred, a bootstrap alert will have the errorMessage.
 */
function Players() {
    const { state } = useLocation();

    return (
        <>
            <ErrorBoundary>
                {state && state.errorMessage && <Alert variant="danger">{state.errorMessage}</Alert>}
                <Main AddComponent={AddPlayer} GetComponent={SinglePlayer} GetAllComponent={AllPlayers} UpdateComponent={UpdatePlayer} DeleteComponent={DeletePlayer}/>
            </ErrorBoundary>
        </>
    );
}

export default Players;