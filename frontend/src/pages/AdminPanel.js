import { useContext } from "react";
import { LoggedInContext, AdministratorContext } from "../components/App";
import PanelSwitcher from "components/PanelSwitcher";

/**
 * Contains panels to switch between sports databases used to perform CRUD operations
 * 
 * @returns JSX component containing the admin panels 
 */
function AdminPanel() {
    const [isAdministrator, setIsAdministrator] = useContext(AdministratorContext);
    if(!isAdministrator) {
        return (
            <h1>Access forbidden.</h1>
        );
    }

     return (
        <>
            <PanelSwitcher/>
        </>
     );
}

export default AdminPanel;