import "./TwoPanes.css"

import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ErrorBoundary from "./ErrorBoundary";
import BaseContainer from "./BaseContainer";

/**
 * TwoPanes contains a row with two columns surrounded by error boundaries. The ratio between the left and right pane is 4 and 8, respectively.
 * 
 * @param {*} leftPane JSX to display on the left.
 * @param {*} rightPane JSX to display on the right.
 * @returns JSX component containing the components in their panes.
 */
function TwoPanes({ leftPane, rightPane }) {
    return (
        <BaseContainer>
            <Row>
                <ErrorBoundary>
                    <Col sm={4}>{leftPane}</Col>
                </ErrorBoundary>
                <ErrorBoundary>
                    <Col sm={8}>{rightPane}</Col>
                </ErrorBoundary>
            </Row>
        </BaseContainer>
    );
}

export default TwoPanes;