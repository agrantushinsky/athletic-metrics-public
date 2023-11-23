import SportViewer from "components/SportViewer";

/**
 * Displays the games page with a ErrorBoundary with the main inside. If an error occurs, an alert will popup above the Main.
 * 
 * @returns JSX component containing the Main surrounded by an errorboundary. If an error occurred, a bootstrap alert will have the errorMessage.
 */
function PowerLift() {
    return (
        <SportViewer sport="Powerlifting"/>
    );
}

export default PowerLift;