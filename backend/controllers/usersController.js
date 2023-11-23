const express = require('express');
const router = express.Router();
const routeRoot = '/users';

const model = require('../models/usersModel');
const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');

const logger = require('../logger');

const bcrypt = require('bcrypt');

const { checkAdministrator } = require('./sessionController.js');

/**
 * Gets an appropriate message based on the exception that was sent to the function and logs
 * it to the console. 
 * 
 * @param {String} context string for what operation caused the error
 * @param {object} err exception object
 * @returns {String} a message based on the exception that occured
 */
function getExceptionString(context, err) {
    let msg;
    if(err instanceof InvalidInputError) { 
        msg = `${context}. Input Error: ${err.message}`;
    } else if(err instanceof DatabaseError) {
        msg = `Database Error: ${err.message}`;
    } else {
        msg = `Unexpected Error: ${err.message}`;
    }

    logger.error(msg);
    return msg;
}

/**
 * Sets the status code based on the exception that occurred.
 * 400 for InvalidInputError, 500 for DatabaseError or any unexpected error.
 * 
 * @param {object} response express http response object
 * @param {object} err exception object 
 */
function setStatusFromException(response, err) {
    if(err instanceof InvalidInputError) { 
        response.status(400);
    } else if(err instanceof DatabaseError) {
        response.status(500);
    } else {
        response.status(500);
    }
}

/**
 * Verifies the username and password match the one stored in the database.
 * 
 * @param {*} username of the user
 * @param {*} password to validate for authentication
 * @returns true if verified login, false otherwise.
 */
async function checkCredentials(username, password) {
    try {
        let user = await model.getSingleUserByName(username);
        if(user) {
            const isSame = await bcrypt.compare(password, user.password);
            if(isSame) {
                return { username: user.username, administrator: user.administrator };
            }
        }

    } catch { /* Do nothing. */ }
    return false;
}

/**
 * User registration endpoint on POST /users/register. The body expects the username and password. The password must be 8 characters long.
 * 200 status on success, 400 for input error, 500 for server error.
 * 
 * @param {*} request HTTP request object 
 * @param {*} response HTTP response object
 */
async function registerUser(request, response) {
    try {
        const username = request.body.username;
        const password = request.body.password;
        const administrator = false;

        if(username && password) {
            let registered = await model.addUser(username, password, administrator);

            if(registered) {
                logger.info("Successfully registered username: " + username);
                response.status(200);
                response.send({ success: true, username: username });
            }
        }     
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to register`, err) });
    }
}
router.post('/register', registerUser);

/**
 * Adds a user to the MongoDB database. 
 * 
 * @param {*} request express http request. POST request on /users.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
/*
async function createUser(request, response) {
    let username = request.body.username;
    let password = request.body.password;
    let administrator = false;

    try {
        let addedUser = await model.addUser(username, password, administrator);
        response.status(200);
        response.send(addedUser);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to add ${username}`, err) });
    }
}
router.post('/', createUser);*/

/**
 * Gets all users in the database and sends them back in an object array.
 * 
 * @param {*} request express http request. GET request on /users/get-all.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showAllUsers(request, response) {
    if(!checkAdministrator(request, response))
        return;

    try {
        // Get all the users
        let users = await model.getAllUsers();

        response.status(200);
        response.send(users);
    } catch(err) {
        // It is impossible to get an InvalidInputError therefore the
        // context argument will never be used, so an empty string is passed.
        let msg = getExceptionString("", err);
        setStatusFromException(response, err);
        response.send({errorMessage: `Failed to get all users. Error: ${msg}`});
    }
}
router.get('/get-all', showAllUsers);

/**
 * Finds the first occurance of a user with the name provided. 
 * The name is provided as a URL parameter and must be alpha characters only.
 * 
 * @param {*} request express http request. GET request on /users/:name.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showUser(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let username = request.params.username;
    try {
        let user = await model.getSingleUserByName(username);
        response.status(200);
        response.send(user);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to locate name: '${username}'`, err)});
    }
}
router.get('/:username', showUser);

/**
 * Updates a single user using the original username provided with the new data. 
 * 
 * @param {*} request express http request. PUT request on /users.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function editUser(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let oldUsername = request.body.oldUsername;
    let username = request.body.username;
    let password = request.body.password;
    let administrator = request.body.administrator;

    try {
        // Only returns true, otherwise it throws.
        if(await model.updateUser(oldUsername, username, password, administrator)) {
            response.status(200);
            response.send({
                oldUsername: oldUsername,
                username: username,
                password: password,
                administrator: administrator
            });
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to update '${oldUsername}'`, err)});
    }
}
router.put('/', editUser);

/**
 * Deletes a single user using the username provided. The username is supplied as a
 * URL parameter and it must be alpha chracters only.
 * 
 * @param {*} request express http request. DELETE request on /users/:name.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function deleteUser(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let username = request.params.username;
    try {
        if(await model.deleteUser(username)) {
            response.status(200);
            //response.send(`Successfully deleted first occurance of '${username}' from the database.`);
            response.send({"username": username})
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to delete '${username}'`, err)});
    }
}
router.delete('/:username', deleteUser);

module.exports = {
    router,
    routeRoot,
    checkCredentials
};