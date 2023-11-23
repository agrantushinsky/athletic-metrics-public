const express = require('express');
const router = express.Router();
const routeRoot = '/teams';

const model = require('../models/teamsModel'); 
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
 * Adds a team to the MongoDB database. 
 * The body expects "name", "sport", and "countryOfOrigin".
 * The name and sport must only be alpha characters, and the countryOfOrigin must be valid country or "Unknown".
 * 
 * @param {*} request express http request. POST request on /teams.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function createTeam(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let name = request.body.name;
    let sport = request.body.sport;
    let countryOfOrigin = request.body.countryOfOrigin;

    let newTeamString = `{name: ${name}, sport: ${sport}, countryOfOrigin: ${countryOfOrigin}}`;

    try {
        let addedTeam = await model.addTeam(name, sport, countryOfOrigin);
        response.status(200);
    
        response.send(addedTeam);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to add ${newTeamString}`, err) });
    }
}
router.post('/', createTeam);

/**
 * Gets all teams contained within the database and creates an message containing
 * the number of teams retrieved and all the team data.
 * 
 * @param {*} request express http request. GET request on /teams/get-all.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showAllTeams(request, response) {
    try {

        let teams = await model.getAllTeams();

        response.status(200);
        response.send(teams);
    } catch(err) {
        // It is impossible to get an InvalidInputError therefore the
        // context argument will never be used, so an empty string is passed.
        let msg = getExceptionString("", err);
        setStatusFromException(response, err);
        response.send({errorMessage: `Failed to get all teams. Error: ${msg}`});
    }
}
router.get('/get-all', showAllTeams);

/**
 * Finds the first occurance of a team with the name provided. 
 * The name is provided as a URL parameter and must be alpha characters only.
 * 
 * @param {*} request express http request. GET request on /teams/:name.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showTeam(request, response) {
    let name = request.params.name;
    try {
        let team = await model.getSingleTeamByName(name);
        response.status(200);
        
        response.send(team);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to locate name: '${name}'`, err)});
    }
}
router.get('/:name', showTeam);

/**
 * Updates a single team using the original name provided with the new data. The body expects "originalName",
 * "newName", "sport", and "newCountryOfOrigin".
 * The original name, new name and sport must only be alpha characters,and the new countryOfOrigin must be a valid country name or "Unknown".
 * 
 * @param {*} request express http request. PUT request on /teams.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function editTeam(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let originalName = request.body.originalName;
    let name = request.body.name;
    let sport = request.body.sport;
    let countryOfOrigin = request.body.countryOfOrigin;

    let newTeamString = `{name: ${name}, sport: ${sport}, countryOfOrigin: ${countryOfOrigin}}`;

    try {
        // Only returns true, otherwise it throws.
        if(await model.updateTeam(originalName, name, sport, countryOfOrigin)) {
            response.status(200);
            response.send({
                originalName: originalName,
                name: name,
                sport: sport,
                countryOfOrigin: countryOfOrigin
            });

        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to update '${originalName}' to '${newTeamString}'`, err)});
    }
}
router.put('/', editTeam);

/**
 * Deletes a single team using the name provided. The name is supplied as a
 * URL parameter and it must be alpha chracters only.
 * 
 * @param {*} request express http request. DELETE request on /teams/:name.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function deleteTeam(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let name = request.params.name;
    try {
        if(await model.deleteTeam(name)) {
            response.status(200);
            //response.send(`Successfully deleted first occurance of '${name}' from the database.`);
            response.send({"name": name})
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to delete '${name}'`, err)});
    }
}
router.delete('/:name', deleteTeam);

module.exports = {
    router,
    routeRoot
};