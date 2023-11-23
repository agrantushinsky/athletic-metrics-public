import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorBoundary from "components/ErrorBoundary";

function MainLayout() {
    return (
        <div>
            <ErrorBoundary>
                <Header />
                <ErrorBoundary>
                    <Outlet />
                </ErrorBoundary>
                <Footer />
            </ErrorBoundary>
        </div>
    )
}

export default MainLayout;