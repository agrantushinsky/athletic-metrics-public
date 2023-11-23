import React from "react";
import SystemError from "pages/SystemError";

/**
 * Component to display components normally until an exception is thrown, once an exception is thrown, it will be replaced by a SystemError component.
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }
    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
    }
    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <SystemError errorMessage="Something went wrong."/>;
        }
        return this.props.children;
    }
}

export default ErrorBoundary;