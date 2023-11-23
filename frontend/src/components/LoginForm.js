import { useContext, useState } from "react";
import { LoggedInContext, AdministratorContext } from "./App";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Contains a user login page designed to log either an administrator, or client in respectfully. Changes the permissions depending on who logged in
 * 
 * @returns JSX component that contains a user login form
 */
function LoginForm() {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);
    const [isAdministrator, setIsAdministrator] = useContext(AdministratorContext);
    const navigate = useNavigate();

    // Submit handler
    const handleSubmit = async (event) => {
        event.preventDefault(); // prevent page reload  

        try {
            const requestOptions = {
                method: "POST",
                credentials: "include",
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
                headers: {
                    "Content-Type": "application/json; charset=UTF-8",
                },
            };

            const response = await fetch(process.env.REACT_APP_BACKEND + "/session/login", requestOptions);
            const result = await response.json();

            if(response.status === 401) {
                setIsLoggedIn(false);
                setIsAdministrator(false);
                navigate("/login", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500) {
                setIsLoggedIn(false);
                setIsAdministrator(false);
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                setIsLoggedIn(true);
                setIsAdministrator(result.administrator);
                navigate("/");
            }
        } catch {
            setIsLoggedIn(false);
            setIsAdministrator(false);
            navigate("/systemerror", {state: { errorMessage: "Fatal connection error to backend occurred."}});
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label><br/>
            <Input type="text" name="username" placeholder="Username..." onChange={(e) => setUsername(e.target.value)}/>
            <br/>
            <label htmlFor="password">Password</label><br/>
            <Input type="password" name="password" placeholder="Password..." onChange={(e) => setPassword(e.target.value)}/>
            <br/>
            <Button type="submit" variant="contained" color="success">Login</Button>
        </form>
    );
}

export default LoginForm;