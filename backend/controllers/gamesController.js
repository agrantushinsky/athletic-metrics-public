const express = require('express');
const router = express.Router();
const routeRoot = '/games';

const model = require('../models/gamesModel');
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
 * Adds a game to the MongoDB database. 
 * The body expects "date", "winning team", "losing team", and "rating".
 * The date must follow YYYY-MM-DD format, 
 * the winning team and losing team  must be a valid name, 
 * rating must be a number between 0-100.
 * 
 * @param {*} request express http request. POST request on /games.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
*/
async function createGames(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let date = request.body.date;
    let winningTeam = request.body.winningTeam;
    let losingTeam = request.body.losingTeam;
    let rating = request.body.rating;


    let newGame = `{date: ${date}, winningTeam: ${winningTeam}, losingTeam: ${losingTeam}}`;

    try {
        let game = await model.addGames(date, winningTeam, losingTeam,rating);
        response.status(200);
        //response.send(`Successfully added game: ${newGameString}`);
        response.send(game);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to add ${newGame}`, err) });
    }
}
router.post('/', createGames);

/**
 * Gets all games contained within the database and creates an message containing
 * the number of games retrieved and all the game data.
 * 
 * @param {*} request express http request. GET request on /games/get-all.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showAllGames(request, response) {
    try {
        // Get all the games
        let games = await model.getAllGames();

        response.status(200);
        response.send(games);
    } catch(err) {
        // It is impossible to get an InvalidInputError therefore the
        // context argument will never be used, so an empty string is passed.
        let msg = getExceptionString("", err);
        setStatusFromException(response, err);
        response.send({errorMessage: `Failed to get all games. Error: ${msg}`});
    }
}
router.get('/get-all', showAllGames);

/**
 * Finds the first occurance of a game with the date and team provided. 
 * The date and team is provided as a URL parameter and must be a valid date and team.
 * 
 * @param {*} request express http request. GET request on /games/:team/date.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function showGame(request, response) {
    let team = request.params.team;
    let date = request.params.date;
    try {
        let game = await model.getSingleGameByTeamAndDate(team,date);
        response.status(200);
        //response.send(`Found game with name: '${game.name}', isTeamBased: ${game.isTeamBased}, countryOfOrigin: ${game.countryOfOrigin}`);
        response.send(game);
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to locate game: '${team} ${date}'`, err)});
    }
}
router.get('/:team/:date', showGame);

/**
 * Updates a single game using the original date and the old team name. The body expects "winning team",
 * "losing team", "date", "rating","target team" and "target date"
 * The targetDate and targetTeam must be valid and all other inputs to swap with will be validated.
 * 
 * @param {*} request express http request. PUT request on /games.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function editGame(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let winningTeam = request.body.winningTeam;
    let losingTeam = request.body.losingTeam;
    let date = request.body.date;
    let rating = request.body.rating;

    let targetTeam = request.body.targetTeam;
    let targetDate = request.body.targetDate;

    let newGameString = `{winningTeam: ${winningTeam}, losingTeam: ${losingTeam}, date: ${date}, rating: ${rating}}`;

    try {
        // Only returns true, otherwise it throws.
        if(await model.updateGame(targetDate, targetTeam, date, winningTeam, losingTeam, rating)) {
            response.status(200);
            response.send({
                date: date,
                winningTeam: winningTeam,
                losingTeam: losingTeam,
                rating: rating
            });
            //response.send(`Successfully updated first occurance of '${originalName}' to ${newGameString}`);
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({errorMessage: getExceptionString(`Failed to update '${date}' to '${newGameString}'`, err)});
    }
}
router.put('/', editGame);

/**
 * Deletes a single game using the date and team provided. The team name and date is supplied as a
 * URL parameter and it must be valid name and the date following the YYYY-MM-DD format.
 * 
 * @param {*} request express http request. DELETE request on /games/:date/:team.
 * @param {*} response express http response. 200 response on success, 400 response on user input error, and 500 response on server/database error.
 */
async function deleteGame(request, response) {
    if(!checkAdministrator(request, response))
        return;

    let date = request.params.date;
    let team = request.params.team 
    try {
        if(await model.deleteGame(team,date)) {
            response.status(200);
            //response.send(`Successfully deleted first occurance of '${name}' from the database.`);
            response.send({date:date,team:team})
        }
    } catch(err) {
        setStatusFromException(response, err);
        response.send({ errorMessage: getExceptionString(`Failed to delete '${date}'`, err)});
    }
}
router.delete('/:date/:team', deleteGame);

module.exports = {
    router,
    routeRoot
};