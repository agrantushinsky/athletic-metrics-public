const express = require('express');
const router = express.Router();
const routeRoot = '/players';

const model = require('../models/playerModel');
const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');

const logger = require('../logger');

const { checkAdministrator } = require('./sessionController');

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
 * Adds a player to the MongoDB database. 
 * The body expects "name", "points", "age", and "team".
 * The name and team must only be alpha characters, the points and age must be between 0-100.
 * 
 * @param {*} request express http request. POST request on /players.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function createPlayer(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let name = request.body.name;
    let points = request.body.points;
    let age = request.body.age;
    let team = request.body.team;
    let newPlayerString = `{name: ${name}, team: ${team}, age: ${age}, points: ${points}`;

    try {
        let addedPlayer = await model.addPlayer(name,points,team,age);
        response.status(200);
       
        response.send(addedPlayer);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to add ${newPlayerString}`, err) });
    }
}
router.post('/', createPlayer);

/**
 * Gets all players contained within the database and creates an message containing
 * the number of players retrieved and all the player data.
 * 
 * @param {*} request express http request. GET request on /players/get-all.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showAllPlayers(request, response) {
    try {
        // Get all the players
        let players = await model.getAllPlayers();

        response.status(200);
        response.send(players);
    } catch(err) {
        // It is impossible to get an InvalidInputError therefore the
        // context argument will never be used, so an empty string is passed.
        let msg = getExceptionString("", err);
        setStatusFromException(response, err);
        response.send({errorMessage: `Failed to get all players. Error: ${msg}`});
    }
}
router.get('/get-all', showAllPlayers);

/**
 * Finds the first occurance of a player with the name provided. 
 * The name is provided as a URL parameter and must be alpha characters only.
 * 
 * @param {*} request express http request. GET request on /players/:name.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showPlayer(request, response) {
    let name = request.params.name;
    try {
        let players = await model.getSinglePlayerbyName(name);
        response.status(200);
        
        response.send(players);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to locate name: '${name}'`, err)});
    }
}
router.get('/:name', showPlayer);

/**
 * Updates a single player using the original name provided with the new data. The body expects "originalName",
 *  "name", "points", "age", and "team".
 * The original name, new name and team must only be alpha characters, the new age and points must be between 0-100 
 * 
 * @param {*} request express http request. PUT request on /players.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function editPlayer(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let originalName = request.body.originalName;
    let newName = request.body.name;
    let newTeam = request.body.team;
    let newAge = request.body.age;
    let newPoints = request.body.points;

    let newPlayerString = `{name: ${newName}, team: ${newTeam}, age: ${newAge}, points: ${newPoints}}`;

    try {
        // Only returns true, otherwise it throws.
        if(await model.updatePlayer(originalName, newName, newTeam, newAge, newPoints)) {
            response.status(200);
            response.send({
                originalName: originalName,
                name: newName,
                team: newTeam,
                age: newAge,
                points: newPoints
            });
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to update '${originalName}' to '${newPlayerString}'`, err)});
    }
}
router.put('/', editPlayer);

/**
 * Deletes a single player using the name provided. The name is supplied as a
 * URL parameter and it must be alpha chracters only.
 * 
 * @param {*} request express http request. DELETE request on /players/:name.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function deletePlayer(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let name = request.params.name;
    try {
        if(await model.deletePlayer(name)) {
            response.status(200);
            //response.send(`Successfully deleted first occurance of '${name}' from the database.`);
            response.send({"name": name})
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to delete '${name}'`, err)});
    }
}
router.delete('/:name', deletePlayer);

module.exports = {
    router,
    routeRoot
};