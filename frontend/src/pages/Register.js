import RegisterForm from "components/RegisterForm";
import { useLocation } from "react-router-dom";
import Alert from "react-bootstrap/Alert";
import BaseContainer from "components/BaseContainer";

/**
 * Page for user registration. Allows to user to pick a username and password and create their account. Errors will be displayed in an alert.
 * 
 * @returns JSX containing a container with the register form. If an error occurrs, an alert will be displayed.
 */
function Register() {
    const { state } = useLocation();

    return (
        <>
            <BaseContainer>
                {state && state.errorMessage && <Alert variant="danger">{state.errorMessage}</Alert>}
                <RegisterForm/>
            </BaseContainer>
        </>
    );
}

export default Register;