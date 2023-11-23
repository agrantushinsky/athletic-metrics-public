const { MongoClient } = require('mongodb');
const validateUtils = require('./validateUtils');
const { DatabaseError } = require('./DatabaseError');

const logger = require('../logger');
const { InvalidInputError } = require('./InvalidInputError');

let client;
let usersCollection;

const collectionName = "users";

const bcrypt = require('bcrypt');
const saltRounds = 10;

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
            usersCollection = db.collection(collectionName);
            try {
                await usersCollection.drop();
            } catch(err) {
                logger.error(`Failed to drop collection '${collectionName}'`)
                throw new DatabaseError(`Failed to drop collection. Error: ${err.message}`);
            }
        }

        // Check to see if the users collection exists
        collectionCursor = await db.listCollections( { name: collectionName } );
        collectionArray = await collectionCursor.toArray();
        if(collectionArray.length == 0) {
            // collation specifying case-insensitive collection
            const collation = { locale: "en", strength: 1 };

            // No match found, so create new collection
            await db.createCollection(collectionName, { collation: collation });
        }
        // convenient access to collection
        usersCollection = db.collection(collectionName);
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

async function userExists(username) {
    // Try and get the user object from the database
    let exists = false;
    try {
        let user = await usersCollection.findOne({ username: username });
        if(user) {
            exists = true;
        }

    } catch { }

    if(exists) {
        throw new InvalidInputError(`Username '${username}' has already been taken.`);
    } else {
        return false;
    }
}

async function addUser(username, password, administrator) {
    // The following functions simply throw when an invalid argument is passed.
    validateUtils.isNameValid(username);
    validateUtils.isBoolean(administrator);
    validateUtils.isValidPassword(password);
    await userExists(username);
    
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let newUser = { 
        username: username,
        password: hashedPassword,
        administrator: administrator
    }

    // Add the new user
    try {
        await usersCollection.insertOne(newUser);
    } catch(err) {
        logger.error(`[Model] Failed to insert user into database. User: ` + 
            `{ username: ${username}, password: ${password}, administrator: ${administrator} }."`);
        throw new DatabaseError(`Failed to insert new user into database. Error: ${err.message}`);
    }

    return newUser;
}

/**
 * Gets a single user object from the database using the username provided.
 * 
 * @param {String} username for search for 
 * @returns {object} the user object if it was found, otherwise if no match: null object.
 * @throws {DatabaseError} thrown when the find operation fails or the name could not be found
 * @throws {InvalidInputError} thrown when the name provided is invalid.
 */
async function getSingleUserByName(username) {
    // Validate the name first (exception thrown on invalid):
    validateUtils.isNameValid(username);

    try {
        // Try and get the user:
        let user = await usersCollection.findOne({ username: username });

        // Return the found user if it is not null
        if(user != null) {
            return user;
        } 
        // Otherwise, throw an exception:
        else {
            // Will get rethrown.
            throw new InvalidInputError('User could not be found in database.');
        }
    } catch (err) { 
        logger.error(`[Model] Failed to get single user by name. Username: "${username}"`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to get single user '${username}' from database. Error: ${err.message}`);
        }
    }
}

/**
 * Queries all the users from the database and returns the result as an array.
 * 
 * @returns {array} of user objects of all the users in the database
 * @throws {DatabaseError} thrown when the find operation fails
 */
async function getAllUsers() {
    try {
        // Get cursor
        let cursor = await usersCollection.find();

        // Get all rows
        let users = await cursor.toArray();

        // Return the users
        return users;
    } catch (err) {
        logger.error("[Model] Failed to get all users.");
        throw new DatabaseError(`Failed to get all users. Error: ${err.message}`);
    }
}

/**
 * 
 * @throws {DatabaseError} thrown the update operation fails or the originalName could not be found
 * @throws {InvalidInputError} thrown when the originalName, newName, newIsTeamBased, or newCountryOfOrigin
 * is invalid.
 */
async function updateUser(oldUsername, username, password, administrator) {
    // Throws if invalid
    validateUtils.isNameValid(oldUsername);
    validateUtils.isNameValid(username);
    validateUtils.isBoolean(administrator);
    validateUtils.isValidPassword(password);
    await userExists(username);

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let newUser = { 
        username: username,
        password: hashedPassword,
        administrator: administrator
    }

    try {
        let result = await usersCollection.replaceOne(
            // Target user
            {username: oldUsername},
            // Replacement data
            newUser);
        
        // Return the new modified user
        if(result.modifiedCount >= 1) {
            return newUser;
        } else {
            // Will get rethrown.
            throw new InvalidInputError('User could not be found in database.');
        }

    } catch(err) {
        logger.error(`[Model] Failed to update "${oldUsername} to ` + 
            `{ username: ${username}, password: ${password}, administrator: ${administrator} }."`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to update '${oldUsername}'. Error: ${err.message}`);
        }
    }
}

/**
 * Deletes the first occurance of a user using the name provided. The name must be alpha characters only.
 * 
 * @param {String} name of the user
 * @returns {boolean} true if successful
 * @throws {DatabaseError} thrown when the delete fails or the user could not be found.
 * @throws {InvalidInputError} thrown when the name provided is invalid.
 */
async function deleteUser(username) {
    // Throws if invalid
    validateUtils.isNameValid(username);

    try {
        let result = await usersCollection.deleteOne({username: username});
        if(result.deletedCount >= 1) {
            return true;
        } else {
            // Will get rethrown.
            throw new InvalidInputError('user could not be found in database.');
        }
    } catch(err) {
        logger.error(`[Model] Failed to delete "${username}" from database.`);
        if(err instanceof InvalidInputError) {
            throw err;
        } else {
            throw new DatabaseError(`Failed to delete '${username}'. Error: ${err.message}`);
        }
    }
}

/**
 * Gets the usersCollection.
 * 
 * @returns {object} usersCollection object
 */
function getCollection() {
    return usersCollection;
}

module.exports = {
    // Managing connection:
    initialize, close, 

    // CRUD operations
    addUser, getSingleUserByName, getAllUsers, updateUser, deleteUser,

    // Getters
    getCollection
};