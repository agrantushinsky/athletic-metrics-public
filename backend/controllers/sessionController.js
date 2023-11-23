const express = require("express");
const { Session, createSession, getSession, deleteSession } = require("./Session");
const router = express.Router();
const routeRoot = "/session";
const { checkCredentials } = require("./usersController");

const logger = require('../logger');

/**
 * Checks if the user is a administrator and if they're it returns true, otherwise returns false and sends back a 401 status code.
 * 
 * @param {*} request HTTP request object
 * @param {*} response HTTP response object
 * @returns true if admin, false otherwise.
 */
function checkAdministrator(request, response) {
    const authenticatedSession = authenticateUser(request);
    if (!authenticatedSession || !authenticatedSession.userSession.administrator) {
        response.status(401); // Unauthorized access
        response.send({errorMessage: "Unauthorized access"});
        return false;
    }
    refreshSession(request, response);

    return true;
}

/**
 * Authentices the user's "sessionId" cookie provided by the request. The cookie must exist, be valid, and not expired.
 * If authenticated, the sessionId and session object will be returned.
 * 
 * @param {*} request HTTP request object, ideally containing the sessionId cookie.
 * @returns {object} with the sessionId and userSession
 */
function authenticateUser(request) {
    // If this request doesn't have any cookies, that means it isn't authenticated. Return null.
    if (!request.cookies) {
        return null;
    } 

    // We can obtain the session token from the requests cookies, which come with every request
    const sessionId = request.cookies["sessionId"];
    if (!sessionId) {
        // If the cookie is not set, return null
        return null;
    } 

    // We then get the session of the user from our session map
    userSession = getSession(sessionId);
    if (!userSession) {
        return null;
    } 

    // If the session has expired, delete the session from our map and return null
    if (userSession.isExpired()) {
        deleteSession(sessionId);
        return null;
    }

    return { sessionId, userSession }; // Successfully validated.
}

/**
 * Verifies the cookie in the request and if so, a cookie with the expiry reset will be sent back to the user.
 * If the cookie could not be valided, a 401 status is sent back.
 * 
 * @param {*} request HTTP request object with sessionId cookie
 * @param {*} response HTTP response object with new sessionId cookie (on success)
 * @returns the new sessionId
 */
function refreshSession(request, response) {
    const authenticatedSession = authenticateUser(request);
    if (!authenticatedSession) {
        response.sendStatus(401); // Unauthorized access
        return;
    }

    // Create and store a new Session object that will expire in 15 minutes.
    const newSessionId = createSession(
        authenticatedSession.userSession.username,
        15,
        authenticatedSession.userSession.administrator
    );

    // Delete the old entry in the session map
    deleteSession(authenticatedSession.sessionId); // Set the session cookie to the new id we generated, with a // renewed expiration time
    response.cookie("sessionId", newSessionId, {
        expires: getSession(newSessionId).expiresAt,
        httpOnly: true,
    });
    return newSessionId;
}

/**
 * On /users/login endpoint for POST requets. Logins in a user using the username and password from the body. On success, 200 status and a sessionId cookie will be sent to the client,
 * 401 on bad login.
 * 
 * @param {*} request HTTP request object with sessionId cookie
 * @param {*} response HTTP response object with new sessionId cookie (on success)
 */
async function loginUser(request, response) {
    const username = request.body.username;
    const password = request.body.password;

    // Validate the username and password
    if (username && password) {
        const checkCredentialsResult = await checkCredentials(username, password);
        if (checkCredentialsResult) {
            logger.info("Logged in user " + username);

            // Create a session for the user that will expire in 15 minutes
            const sessionId = createSession(username, 15, checkCredentialsResult.administrator);

            // Save the cookie that will expire
            response.cookie("sessionId", sessionId, { expires: getSession(sessionId).expiresAt, httpOnly: true, });
            response.status(200);
            response.send({administrator: checkCredentialsResult.administrator});
            return;
        } else {
            let errMsg =  "Failed to login " + username + ". Invalid user or password.";
            logger.error(errMsg);
            response.status(401);
            response.send({errorMessage: errMsg})
        }
    } else {
        let errMsg = "Failed to login. Empty username or password.";
        logger.error(errMsg);
        response.status(401);
        response.send({errorMessage: errMsg})
    }
}
router.post("/login", loginUser);

/**
 * User logout endpoint on /users/logout for GET requests. Destroys the session associated with the request and sends back a cookie expiring instantly. 200 level response on success, 401 on expired cookie.
 * 
 * @param {*} request HTTP request object
 * @param {*} response HTTP reponse object
 */
function logoutUser(request, response) {
    const authenticatedSession = authenticateUser(request);
    if (!authenticatedSession) {
        // Unauthorized access
        response.sendStatus(401);
        return;
    }

    deleteSession(authenticatedSession.sessionId);
    console.log("Logged out user " + authenticatedSession.userSession.username);

    // "erase" cookie by forcing it to expire.
    response.cookie("sessionId", "", { expires: new Date(), httpOnly: true });
    response.sendStatus(200);
}
router.get("/logout", logoutUser);

/**
 * Users auth endpoint on /users/auth for GET requests. 200 status on success with object containing an administrator boolean. 401 on bad login.
 * 
 * @param {*} request HTTP request object
 * @param {*} response HTTP reponse object
 */
function authUser(request, response) {
    try {
        const authenticatedSession = authenticateUser(request);
        if (!authenticatedSession) {
            response.sendStatus(401);
        } else {
            response.status(200);
            response.send({administrator: authenticatedSession.userSession.administrator});
        }
    } catch(error) {
        response.sendStatus(401);
    }
}
router.get("/auth", authUser);

module.exports = {
  router,
  routeRoot,
  loginUser,
  authenticateUser,
  refreshSession,
  checkAdministrator
};
