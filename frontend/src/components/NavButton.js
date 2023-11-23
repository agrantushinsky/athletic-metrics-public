import { NavLink, useResolvedPath, useMatch } from "react-router-dom";
import Button from "@mui/material/Button";
import NavWrapper from "./NavWrapper";

/**
 * Simple navigation button that leades to a webpage
 * 
 * @param {*} props 
 * @returns JSX component containing a navigation button to a desired webpage
 */
function NavButton(props) {
    let resolved = useResolvedPath(props.to);
    let match = useMatch({path: resolved.pathname, end: true});

    return (
        <NavWrapper to={props.to}>
            <Button variant={match ? "contained" : "outlined"}>{props.label}</Button>
        </NavWrapper>
    );
}

export default NavButton;