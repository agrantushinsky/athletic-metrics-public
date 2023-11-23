import Main from "components/Main";
import { useLocation } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import ErrorBoundary from "components/ErrorBoundary";

import AddTeam from 'components/AddTeam';
import SingleTeam from 'components/SingleTeam';
import AllTeams from 'components/AllTeams';
import UpdateTeam from 'components/UpdateTeam';
import DeleteTeam from 'components/DeleteTeam';

/**
 * Displays the teams page with a ErrorBoundary with the main inside. If an error occurs, an alert will popup above the Main.
 * 
 * @returns JSX component containing the Main surrounded by an errorboundary. If an error occurred, a bootstrap alert will have the errorMessage.
 */
function Teams() {
    const { state } = useLocation();

    return (
        <>
            <ErrorBoundary>
                {state && state.errorMessage && <Alert variant="danger">{state.errorMessage}</Alert>}
                <Main AddComponent={AddTeam} GetComponent={SingleTeam} GetAllComponent={AllTeams} UpdateComponent={UpdateTeam} DeleteComponent={DeleteTeam}/>
            </ErrorBoundary>
        </>
    );
}

export default Teams;