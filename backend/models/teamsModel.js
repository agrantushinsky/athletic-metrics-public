const { MongoClient } = require('mongodb');
const validateUtils = require('./validateUtils');
const { DatabaseError } = require('./DatabaseError');
const { InvalidInputError } = require('./InvalidInputError');

const logger = require('../logger');

let client;
let teamCollection;

const collectionName = "teams";

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
        if(resetFlag) {
            teamCollection = db.collection(collectionName);
            try {
                await teamCollection.drop();
            } catch(err) {
                logger.error(`Failed to drop collection '${collectionName}'`)
                throw new DatabaseError(`Failed to drop collection. Error: ${err.message}`);
            }
        }

        // Check to see if the sports collection exists
        collectionCursor = await db.listCollections( { name: collectionName } );
        collectionArray = await collectionCursor.toArray();
        if(collectionArray.length == 0) {
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };

            // No match found, so create new collection
            await db.createCollection(collectionName, { collation: collation });
        }
        // convenient access to collection
        teamCollection = db.collection(collectionName);
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
 * Adds a team to the MongoDB database. The name and sport must only be alpha characters, and the countryOfOrigin must be valid country, otherwise an
 * exception is thrown. If the insertion fails, DatabaseError is thrown.
 * 
 * @param {String} name of the team
 * @param {string} sport of the team
 * @param {String} countryOfOrigin full country name for the team's country of origin
 * @return {object} object of the team added to the database
 * @throws {DatabaseError} thrown when database insertion fails
 * @throws {InvalidInputError} thrown when names contains non-alpha characters, isTeamBased is not a boolean, or if countryOfOrigin is not a valid country.
 */
async function addTeam(name, sport, countryOfOrigin) {
    // The following functions simply throw when an invalid argument is passed.
    validateUtils.isNameValid(name);
    validateUtils.isNameValid(sport); 
    validateUtils.isValidCountry(countryOfOrigin);

    let newTeam = { 
        name: name, 
        sport: sport, 
        countryOfOrigin: countryOfOrigin
    }


    try {
        await teamCollection.insertOne(newTeam);
    } catch(err) {
        logger.error(`[Model] Failed to insert team into database. Team: ` + 
            `{ name: ${newTeam.name}, sport: ${newTeam.sport}, countryOfOrigin: ${newTeam.countryOfOrigin} }."`);
        throw new DatabaseError(`Failed to insert new team into database. Error: ${err.message}`);
    }

    return newTeam;
}

/**
 * Gets a single team object from the database using the name provided.
 * 
 * @param {String} name the name of the team
 * @returns {object} the team object if it was found, otherwise if no match: null object.
 * @throws {DatabaseError} thrown when the find operation fails or the name could not be found
 * @throws {InvalidInputError} thrown when the name provided is invalid.
 */
async function getSingleTeamByName(name) {
    // Validate the name first (exception thrown on invalid):
    validateUtils.isNameValid(name);

    try {
        // Try and get the team:
        let team = await teamCollection.findOne({ name: name });

        // Return the found team if it is not null
        if(team != null) {
            return team;
        } 
        // Otherwise, throw an exception:
        else {
            // Will get rethrown.
            throw new InvalidInputError('Team could not be found in database.');
        }
    } catch (err) { 
        logger.error(`[Model] Failed to get single team by name. Name: "${name}"`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to get single team '${name}' from database. Error: ${err.message}`);
        }
    }
}

/**
 * Queries all the teams from the database and returns the result as an array.
 * 
 * @returns {object array} of team objects of all the teams in the database
 * @throws {DatabaseError} thrown when the find operation fails
 */
async function getAllTeams() {
    try {
        // Get cursor
        let cursor = await teamCollection.find();

        // Get all rows
        let team = await cursor.toArray();

        // Return the teams
        return team;
    } catch (err) {
        logger.error("[Model] Failed to get all teams.");
        throw new DatabaseError(`Failed to get all teams. Error: ${err.message}`);
    }
}

/**
 * Replaces a team that matches the originalName sent. The name and sport must only be alpha characters 
* ,and the countryOfOrigin must be valid country.
 * 
 * @param {String} originalName of the sport
 * @param {String} newName of the sport
 * @param {boolean} newSport of the sport
 * @param {String} newCountryOfOrigin of the sport
 * @returns {boolean} true if successful
 * @throws {DatabaseError} thrown the update operation fails or the originalName could not be found
 * @throws {InvalidInputError} thrown when any of the passed in fields are invalid.
 */
async function updateTeam(originalName, newName, newSport, newCountryOfOrigin) {
    // Throws if invalid
    validateUtils.isNameValid(originalName);
    validateUtils.isNameValid(newName);
    validateUtils.isNameValid(newSport);
    validateUtils.isValidCountry(newCountryOfOrigin);

    let newTeam = { 
        name: newName, 
        sport: newSport,
        countryOfOrigin: newCountryOfOrigin
    }

    try {
        let result = await teamCollection.replaceOne(
            // Target team
            {name: originalName},
            // Replacement data
            newTeam,);
        
        // Return the new modified team
        if(result.modifiedCount >= 1) {
            return newTeam;
        } else {
            // Will get rethrown.
            throw new InvalidInputError('Team could not be found in database.');
        }

    } catch(err) {
        logger.error(`[Model] Failed to update "${originalName} to ` + 
            `{ name: ${newTeam.name}, isTeamBased: ${newTeam.sport}, countryOfOrigin: ${newTeam.countryOfOrigin} }."`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to update '${originalName}'. Error: ${err.message}`);
        }
    }
}

/**
 * Deletes the first occurance of a team using the name provided. The name must be alpha characters only.
 * 
 * @param {String} name of the team
 * @returns {boolean} true if successful
 * @throws {DatabaseError} thrown when the delete fails or the team could not be found.
 * @throws {InvalidInputError} thrown when the name provided is invalid.
 */
async function deleteTeam(name) {
    // Throws if invalid
    validateUtils.isNameValid(name);

    try {
        let result = await teamCollection.deleteOne({name: name});
        if(result.deletedCount >= 1) {
            return true;
        } else {
            // Will get rethrown.
            throw new InvalidInputError('Team could not be found in database.');
        }
    } catch(err) {
        logger.error(`[Model] Failed to delete "${name}" from database.`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to delete '${name}'. Error: ${err.message}`);
        }
    }
}

/**
 * Gets the teamColelction.
 * 
 * @returns {object} teamcollection object
 */
function getCollection() {
    return teamCollection;
}

module.exports = {
    // Managing connection:
    initialize, close, 

    // CRUD operations
    addTeam, getSingleTeamByName, getAllTeams, updateTeam, deleteTeam,

    // Getters
    getCollection
};