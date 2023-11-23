import "./Main.css"

import { useState } from "react";
import Menu from "./Menu";
import TwoPanes from "./TwoPanes";

/**
 * Main display for the /sports page. Built using TwoPanes, left side containing the available CRUD operations and 
 * the right side to display the corrosponding one that is selected.
 * 
 * @returns JSX component containing TwoPanes component
 */
function Main({AddComponent, GetComponent, GetAllComponent, UpdateComponent, DeleteComponent}) {
    const defaultRightPane = <p>Welcome to the Sport manager</p>;
    const [rightPane, setRightPane] = useState(defaultRightPane);

    const defaultLeftPane = <Menu setDisplay={setRightPane} AddComponent={AddComponent} GetComponent={GetComponent} GetAllComponent={GetAllComponent} UpdateComponent={UpdateComponent} DeleteComponent={DeleteComponent}/>
    const [leftPane, setLeftPane] = useState(defaultLeftPane);

    return (
        <div className="Main">
            <TwoPanes leftPane={leftPane} rightPane={rightPane}/>
        </div>
    )
}

export default Main;