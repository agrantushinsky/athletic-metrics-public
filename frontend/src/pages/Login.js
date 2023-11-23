import LoginForm from "components/LoginForm";
import { Link, useLocation } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import BaseContainer from "components/BaseContainer";

/**
 * Contains the login page for the user to login with
 * 
 * @returns JSX component containing the login page for the user to login 
 */
function Login() {
    const { state } = useLocation();

    return (
        <BaseContainer width="100px">
            {state && state.infoMessage && <Alert variant="primary">{state.infoMessage}</Alert>}
            {state && state.errorMessage && <Alert variant="danger">{state.errorMessage}</Alert>}
            <LoginForm/>
            <br/>
            Don't have an account? <Link to="/register">Register here</Link>.

        </BaseContainer>
    );
}

export default Login;