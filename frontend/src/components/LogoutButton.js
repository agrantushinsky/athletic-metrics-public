import Button from "@mui/material/Button";
import { LoggedInContext, AdministratorContext  } from "components/App";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Buttons that signs out the user and deletes their session cookie.
 * 
 * @returns JSX containing button to logout the user.
 */
function LogoutButton() {
    const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);
    const [isAdministrator, setIsAdministrator] = useContext(AdministratorContext);
    const navigate = useNavigate();

    // Submit handler
    const performLogout = async (event) => {
        event.preventDefault(); // prevent page reload  

        try {
            const requestOptions = {
                method: "GET",
                credentials: "include",
            };

            // TODO: Add alerts.
            const response = await fetch(process.env.REACT_APP_BACKEND + "/session/logout", requestOptions);
            if(response.status === 200) {
                setIsLoggedIn(false);
                setIsAdministrator(false);
                navigate("/");
            } else if (response.status === 401) {
                setIsLoggedIn(false);
                setIsAdministrator(false);
                return;
            } else {
                setIsLoggedIn(false);
                setIsAdministrator(false);
            }
        } catch(error) {
            setIsLoggedIn(false);
            setIsAdministrator(false);
        }
    };

    return (
        <Button variant="contained" onClick={performLogout}>
            Logout
        </Button>
    );
}

export default LogoutButton;