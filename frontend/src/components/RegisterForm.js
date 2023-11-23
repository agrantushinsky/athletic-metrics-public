import { useContext, useState } from "react";
import { LoggedInContext } from "./App";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button'
import Input from '@mui/material/Input';

/**
 * Contains registration form for a user to create an account. User information is stored within a database
 * 
 * @returns JSX component containing a registration form for client use 
 */
function RegisterForm() {
    const [username, setUsername] = useState(null);
    const [password, setPassword] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useContext(LoggedInContext);
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

            const response = await fetch(process.env.REACT_APP_BACKEND + "/users/register", requestOptions);
            const result = await response.json();

            if(response.status === 400) {
                navigate("/register", {state: { errorMessage: result.errorMessage}});
            } else if(response.status === 500) {
                navigate("/systemerror", {state: { errorMessage: result.errorMessage}});
            } else {
                navigate("/login", {state: { infoMessage: `Registered '${result.username}'. You may now login.` }});
            }
        } catch {
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
            <Button type="submit" variant="contained" color="success">Create Account</Button>
        </form>
    );
}

export default RegisterForm;