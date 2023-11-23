import { NavLink } from "react-router-dom";

/**
 * Contains a link to another page
 * 
 * @param {*} props 
 * @returns JSX component that links a button to another page
 */
function NavWrapper(props) {

    return (
        <NavLink to={props.to}>
            {props.children}
        </NavLink>
    );
}

export default NavWrapper;