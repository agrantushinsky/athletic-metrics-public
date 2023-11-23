import { Link, useLocation } from "react-router-dom";
/**
 * Component with a heading saying there has been an input error and the error message from useLocation()'s state.
 * 
 * @returns JSX component containing heading, paragraph with error, and a link back to the home.
 */
function UserError() {
    const { state } = useLocation();

    return (
        <>
            <h1>There was an input error</h1>
            <p>{state.errorMessage}</p>
            <Link to="Home">Home</Link>
        </>
    );
}

export default UserError;