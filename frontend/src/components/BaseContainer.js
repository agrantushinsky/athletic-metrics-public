import "./BaseContainer.css";

import { Container } from "react-bootstrap";

/**
 * Base container for website components. Styled with a gray background with margins.
 * 
 * @param {*} children to display in the container
 * @returns JSX containing children in the styled div.
 */
function BaseContainer({children, width}) {
    return (
        <Container className="baseContainer" width={width}>
            {children}
        </Container>
    );
}

export default BaseContainer;