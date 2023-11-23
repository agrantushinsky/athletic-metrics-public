import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";

/**
 * Displays an error using the errorMessage from state using useLocation().
 * 
 * @returns JSX component with heading, paragraph with error and a link back to home.
 */
function SystemError() {
    const { state } = useLocation();
    return (
        <>
            <h1>There was a system error!</h1>
            <p>{state.errorMessage}</p>
            <Link to="Home">Home</Link>
        </>
    );
}

export default SystemError;