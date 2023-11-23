const { MongoClient } = require('mongodb');
const validateUtils = require('./validateUtils');
const { DatabaseError } = require('./DatabaseError');
const { InvalidInputError } = require('./InvalidInputError');

const logger = require('../logger');

let client;
let gamesCollection;

const collectionName = "games";

/**
 * Connect to database using the arguments sent. A collection will be
 * created with case-insensitivity enabled.
 * 
 * @param {String} dbName database name for the client
 * @param {String} dbURL connection url for the database
 * @param {boolean} resetFlag flag for resetting the database
 */
async function initialize(dbName, dbURL, resetFlag) {
    try {
        client = new MongoClient(dbURL);

        await client.connect();

        logger.info("Successfully connected to MongoDB");

        const db = client.db(dbName);

        // Drop collection if resetFlag is true
        if (resetFlag) {
            gamesCollection = db.collection(collectionName);
            try {
                await gamesCollection.drop();
            } catch (err) {
                logger.error(`Failed to drop collection '${collectionName}'`)
                throw new DatabaseError(`Failed to drop collection. Error: ${err.message}`);
            }
        }

        // Check to see if the games collection exists
        collectionCursor = await db.listCollections({ name: collectionName });
        collectionArray = await collectionCursor.toArray();
        if (collectionArray.length == 0) {
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };

            // No match found, so create new collection
            await db.createCollection(collectionName, { collation: collation });
        }
        // convenient access to collection
        gamesCollection = db.collection(collectionName);
    } catch (err) {
        logger.error(`Fatal database error occurred. Error: ${err.message}`);
        throw new DatabaseError(err.message);
    }
}

/**
 * Closes the connection to MongoDB.
 */
async function close() {
    try {
        await client.close();
        logger.info("MongoDB connection closed");
    } catch (err) {
        logger.error(err.message);
    }
}

/**
 * Adds a game to the MongoDB database. 
 * The body expects "date", "winning team", "losing team", and "rating".
 * The date must follow YYYY-MM-DD format, 
 * the winning team and losing team  must be a valid name, 
 * rating must be a number between 0-100. otherwise an
 * exception is thrown. If the insertion fails, DatabaseError is thrown.
 * 
 * @param {String} date of the game
 * @param {String} winningTeam: the name of the winning team
 * @param {String} losingTeam the name of the losing team
 * @param {Int} rating the rating of the game
 * @return {object} object of the game added to the database
 * @throws {DatabaseError} thrown when database insertion fails
 * @throws {InvalidInputError} thrown when the date does not follow YYYY-MM-DD format, the winning team and losing team are not valid name and if rating is not between 0-100
 */
async function addGames(date, winningTeam, losingTeam, rating) {
    // The following functions simply throw when an invalid argument is passed.
    validateUtils.isValidDate(date)
    validateUtils.isNameValid(winningTeam);
    validateUtils.isNameValid(losingTeam);
    validateUtils.isValidRating(rating);

    let newGame = {
        date: date,
        winningTeam: winningTeam,
        losingTeam: losingTeam,
        rating: rating
    }

    // Add the new game
    try {
        await gamesCollection.insertOne(newGame);
    } catch (err) {
        logger.error(`[Model] Failed to insert game into database. Game: ` +
            `{ date: ${newGame.date}, winningTeam: ${newGame.winningTeam}, losingTeam: ${newGame.losingTeam},rating: ${newGame.rating} }."`);
        throw new DatabaseError(`Failed to insert new game into database. Error: ${err.message}`);
    }

    return newGame;
}

/**
 * Gets a single games object from the database using the team and date.
 * 
 * @param {String} team The name of the team 
 * @param {String} team The date of the game 
 * @returns {object} the game object if it was found, otherwise if no match: null object.
 * @throws {DatabaseError} thrown when the find operation fails or the date and team could not be found
 * @throws {InvalidInputError} thrown when the team and date are invalid
 */
async function getSingleGameByTeamAndDate(team, date) {
  
    validateUtils.isNameValid(team);
    validateUtils.isValidDate(date);

    try {
        // Try and get the game:
        let game = await gamesCollection.findOne({ $or: [{ winningTeam: team }, { losingTeam: team }], date: date });

        // Return the found game if it is not null
        if (game != null) {
            return game;
        }
        // Otherwise, throw an exception:
        else {
            // Will get rethrown.
            throw new InvalidInputError('Game could not be found in database.');
        }
    } catch (err) {
        logger.error(`[Model] Failed to get single game by date. Date: "${date}" for team: "${team}`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to get single game '${date}' ${team} from database. Error: ${err.message}`);
        }
    }
}

/**
 * Queries all the games from the database and returns the result as an array.
 * 
 * @returns {object array} of game objects of all the games in the database
 * @throws {DatabaseError} thrown when the find operation fails
 */
async function getAllGames() {
    try {
        // Get cursor
        let cursor = await gamesCollection.find();

        // Get all rows
        let games = await cursor.toArray();

        // Return the games
        return games;
    } catch (err) {
        logger.error("[Model] Failed to get all games.");
         throw new DatabaseError(`Failed to get all games. Error: ${err.message}`);
    }
}

/**
 *Replaces the values of a single game using the original date and original team. The body expects "winning team",
 * "losing team", "date", "rating","target team" and "target date"
 * The targetDate and targetTeam must be valid and all other inputs to swap with will be validated.
 * @param {String} targetTeam the team to search and replace
 * @param {String} targetDate the date to search and replace
 * @param {String} winningTeam the new winning team
 * @param {String} losingTeam the new losing team
 * @param {boolean} date the new date of the game
 * @param {String} rating the rating of the game
 * @returns {object} the game object if it was found, otherwise if no match: null object.
 * @throws {DatabaseError} thrown the update operation fails or the target date and team could not be found
 * @throws {InvalidInputError} thrown when any of the passed in values are invalid 
 */
async function updateGame(targetDate, targetTeam, date, winningTeam, losingTeam, rating) {
    // Throws if invalid
    validateUtils.isNameValid(targetTeam);
    validateUtils.isValidDate(targetDate);

    validateUtils.isNameValid(winningTeam);
    validateUtils.isNameValid(losingTeam);
    validateUtils.isValidDate(date);
    validateUtils.isValidRating(rating);

    let newGame = {
        date: date,
        winningTeam: winningTeam,
        losingTeam: losingTeam,
        rating: rating
    }


    try {
        let result = await gamesCollection.replaceOne(
            // Target game
            { $or: [{ winningTeam: targetTeam }, { losingTeam: targetTeam }], date: targetDate },
            // Replacement data
            newGame);

        // Return the new modified game
        if (result.modifiedCount >= 1) {
            return newGame;
        } else {
            // Will get rethrown.
            throw new InvalidInputError('Game could not be found in database.');
        }

    } catch (err) {
        logger.error(`[Model] Failed to update "${date} to ` +
            `{ date: ${newGame.date}, winning team: ${newGame.winningTeam}, losing team: ${newGame.losingTeam}, rating: ${newGame.rating} }."`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to update '${targetDate}' & '${targetTeam}'. Error: ${err.message}`);
        }
    }
}

/**
 * Deletes the first occurance of a game using the date and team provided.
 * 
 * @param {String} team the team to delete
 * @param {String} date the date of the game delete
 * @returns {boolean} true if the game was deleted 
 * @throws {DatabaseError} thrown when the delete fails or the game could not be found.
 * @throws {InvalidInputError} thrown when the date or team provided is invalid.
 */
async function deleteGame(team, date) {
    // Throws if invalid
    validateUtils.isNameValid(team);
    validateUtils.isValidDate(date);

    try {
        let result = await gamesCollection.deleteOne({ $or: [{ winningTeam: team }, { losingTeam: team }], date: date });
        if (result.deletedCount >= 1) {
            return true;
        } else {
            // Will get rethrown.
            throw new InvalidInputError('Game could not be found in database.');
        }
    } catch (err) {
        logger.error(`[Model] Failed to delete "${date}" ${team} from database.`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to delete "${date}" ${team}. Error: ${err.message}`);
        }
    }
}

/**
 * Gets the gamesCollection.
 * 
 * @returns {object} gamesCollection object
 */
function getCollection() {
    return gamesCollection;
}

module.exports = {
    // Managing connection:
    initialize, close,

    // CRUD operations
    addGames, getSingleGameByTeamAndDate, getAllGames, updateGame, deleteGame,

    // Getters
    getCollection
};