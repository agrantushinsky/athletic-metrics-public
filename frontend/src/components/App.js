import {Route, Routes, Navigate} from "react-router-dom";
import MainLayout from 'layouts/MainLayout';
import Home from 'pages/Home';
import About from 'pages/About';
import UserError from 'pages/UserError';
import SystemError from 'pages/SystemError'
import Login from 'pages/Login';
import Register from 'pages/Register';
import ErrorBoundary from './ErrorBoundary';
import { createContext, useState, useEffect } from "react";
import AdminPanel from "pages/AdminPanel";
import Socccer from "pages/Soccer";
import BaseBall from "pages/Baseball";
import FootBall from "pages/Football";
import PowerLift from "pages/Powerlifting";
import BasketBall from "pages/Basketball";

const LoggedInContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

const AdministratorContext = createContext({
  isAdministrator: false,
  setIsAdministrator: () => {},
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdministrator, setIsAdministrator] = useState(false);
  const loggedInValueAndSetter = [isLoggedIn, setIsLoggedIn];
  const administratorValueAndSetter = [isAdministrator, setIsAdministrator];

  useEffect(() => {
    async function checkForLoggedIn() {
      try {
        // fetch the auth endpoint passing our cookies.
        const response = await fetch(process.env.REACT_APP_BACKEND + "/session/auth", {
          method: "GET",
          credentials: "include",
        });
        const result = await response.json();
        if (response.status === 200) {
          setIsLoggedIn(true);
          setIsAdministrator(result.administrator);
        } else {
          // redundant, but here for safety.
          setIsLoggedIn(false); 
          setIsAdministrator(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
        setIsAdministrator(false);
      }
    }
    checkForLoggedIn();
  }, []);

  return (
    <div className="App">
      <LoggedInContext.Provider value={loggedInValueAndSetter}>
        <AdministratorContext.Provider value={administratorValueAndSetter}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<MainLayout/>}>
                <Route index element={<Home/>}/>          
                <Route path="usererror" element={<UserError/>}/>
                <Route path="systemerror" element={<SystemError/>}/>
                <Route path="about" element={<About/>}/>
                <Route path="soccer" element={<Socccer/>}/>
                <Route path="basketball" element={<BasketBall/>}/>
                <Route path="baseball" element={<BaseBall/>}/>
                <Route path="football" element={<FootBall/>}/>
                <Route path="powerlift" element={<PowerLift/>}/>
                <Route path="login" element={<Login/>}/>
                <Route path="register" element={<Register/>}/>
                <Route path="adminpanel" element={<AdminPanel/>}/>
              </Route>
              <Route path="*" element={<Navigate to="/"/>} />
            </Routes>
          </ErrorBoundary>
        </AdministratorContext.Provider>
      </LoggedInContext.Provider>     
    </div>
  );
}

export default App;
export { LoggedInContext, AdministratorContext };