///*************************************
//REQUIRES
//**************************************
const { MongoClient, Collection } = require("mongodb");
const logger = require("../logger");
let collectionName = "players";
const validateUtils = require('./validateUtils');
const { DatabaseError } = require('./DatabaseError');
const { InvalidInputError } = require('./InvalidInputError');

//holds the connection to the database
let client;
//holds the collection/ values that reside in the database  
var playersCollection;
//this holds access to the database to get the collection within it
let db;

/**
 * Initialize
 * ensure proper connection to the database
 * makes sure there is a collection called statistics for either of the databases
 * @param {String} nameOfDb will be the name of the database
 * @param {boolean} resetFlag true will make a new/reset collection or false will grab the existing collection
 * @param {string} url url to access the db
 * @throws Throws if invalid database
 */
async function initialize(nameOfDb, url, resetFlag) {
  try {
    client = new MongoClient(url);
    await client.connect();
    //logs to show user connection was successful
    logger.info("Connected successfully to database");
    db = client.db(nameOfDb);

    if (resetFlag) {
      collectionCursor = db.listCollections({ name: collectionName });
      let collectionArray = await collectionCursor.toArray();

      //will reset the collection if it exists due to reset flag being true
      if (collectionArray.length >= 1) {
        await db.collection(collectionName).drop();
      }
      //creates a case insensitive collection
      const collation = { locale: "en", strength: 1 };
      await db.createCollection(collectionName, { collation: collation });

      playersCollection = db.collection(collectionName);
    } else {
      collectionCursor = await db.listCollections({ name: collectionName });
      collectionArray = await collectionCursor.toArray();

      if (collectionArray.length == 0) {
        const collation = { locale: "en", strength: 1 };

        await db.createCollection(collectionName, { collation: collation });
      }
      playersCollection = db.collection(collectionName);
    }
  } catch (error) {
    logger.error("Error while connecting to database in initialize function. " + error.message)
    throw new InvalidDatabaseError("Error while connecting to database.");
  }
}

//Closes the database connection
async function close() {
  try {
    await client.close();
    logger.info("Connection closed successfully");
  } catch (error) {
    logger.error(error.message);
  }
}

/**
 * Gets all collections and returns the result
 * @returns returns the collection to be used in other functions.
 */
function getCollection() {
  return playersCollection;
}
/**
 * Adds a player to the MongoDB database. 
 * The body expects "name", "points", "age", and "team".
 * The name and team must only be alpha characters, the points and age must be between 0-100.
 * Otherwise an error will be thrown.
 * @param {*} name the name of the player
 * @param {*} points the amount of points the player has
 * @param {*} team the team the player is on
 * @param {*} age the age of the player
 * @returns an object of the new player created
* @throws {DatabaseError} thrown when the add operation fails or the name could not be found
* @throws {InvalidInputError} thrown when the any of the paassed in values are invalid.
 */
async function addPlayer(name, points, team, age) {
  // The following functions simply throw when an invalid argument is passed.
  validateUtils.isNameValid(name);
  validateUtils.isNameValid(team);
  validateUtils.IsValidAge(age);
  validateUtils.IsValidPoints(points)

  let newPlayer = { 
      name: name, 
      team: team,
      age: age,
      points:points,

  }

  // Add the new player
  try {
      await playersCollection.insertOne(newPlayer);
  } catch(err) {
      logger.error(`[Model] Failed to insert player into database. PlayerName: ` + 
          `{ name: ${newPlayer.name}, team: ${newPlayer.team}, age: ${newPlayer.age} }."`);
      throw new DatabaseError(`Failed to insert new player into database. Error: ${err.message}`);
  }

  return newPlayer;
}

/**
* Gets a single players object from the database using the name provided.
* 
* @param {String} name the name of the player to find
* @returns {object} the player object if it was found, otherwise if no match: null object.
* @throws {DatabaseError} thrown when the find operation fails or the name could not be found
* @throws {InvalidInputError} thrown when the name provided is invalid.
*/
async function getSinglePlayerbyName(name) {
  // Validate the name first (exception thrown on invalid):
  validateUtils.isNameValid(name);
  try {
      // Try and get the player:
      let player = await playersCollection.findOne({ name: name });

      // Return the found player if it is not null
      if(player != null) {
          return player;
      } 
      // Otherwise, throw an exception:
      else {
          // Will get rethrown.
          throw new InvalidInputError('Player could not be found in database.');
      }
  } catch (err) { 
      logger.error(`[Model] Failed to get single player by name. Name: "${name}"`);
      if(err instanceof InvalidInputError) {
        throw err;
      } else {
        throw new DatabaseError(`Failed to get single player '${name}' from database. Error: ${err.message}`);
      }
  }
}

/**
* Queries all the players from the database and returns the result as an array.
* 
* @returns {object array} of player objects of all the players in the database
* @throws {DatabaseError} thrown when the find operation fails
*/
async function getAllPlayers() {
  try {
      // Get cursor
      let cursor = await playersCollection.find();

      // Get all rows
      let players = await cursor.toArray();

      // Return the players
      return players;
  } catch (err) {
      logger.error("[Model] Failed to get all players.");
      throw new DatabaseError(`Failed to get all players. Error: ${err.message}`);
  }
}

/**
* Replaces a player that matches the originalName sent. The name and team must only be alpha characters, the 
*  and the points and age must be a valid integer between 0-100.
* 
* @param {String} originalName of the player
* @param {String} newName of the player
* @param {String} newTeam of the player
* @param {Int} newAge of the player
 *@param {Int} newAge of the player
  *@param {String} newPoints of the player
* @returns {boolean} true if successful
* @throws {DatabaseError} thrown the update operation fails or the originalName could not be found
* @throws {InvalidInputError} thrown when any of the passed in items are invalid.
*/
async function updatePlayer(originalName, newName, newTeam, newAge,newPoints) {
  // Throws if invalid
  validateUtils.isNameValid(originalName);
  validateUtils.isNameValid(newName);
  validateUtils.isNameValid(newTeam);
  validateUtils.IsValidAge(newAge);
  validateUtils.IsValidPoints(newPoints)

  let newPlayer = { 
      name: newName, 
      team: newTeam,
      age: newAge,
      points: newPoints
  }

  try {
      let result = await playersCollection.replaceOne(
          // Target player
          {name: originalName},
          // Replacement data
          newPlayer);
      
      // Return the new modified player
      if(result.modifiedCount >= 1) {
          return newPlayer;
      } else {
          // Will get rethrown.
          throw new InvalidInputError('Player could not be found in database.');
      }

  } catch(err) {
      logger.error(`[Model] Failed to update "${originalName} to ` + 
          `{ name: ${newPlayer.name}, team: ${newPlayer.team}, points: ${newPlayer.points},age: ${newPlayer.age}}."`);
      if(err instanceof InvalidInputError) {
        throw err;
      } else {
        throw new DatabaseError(`Failed to update '${originalName}'. Error: ${err.message}`);
      }
  }
}

/**
* Deletes the first occurance of a player using the name provided. The name must be alpha characters only.
* 
* @param {String} name of the player
* @returns {boolean} true if successful
* @throws {DatabaseError} thrown when the delete fails or the player could not be found.
* @throws {InvalidInputError} thrown when the name provided is invalid.
*/
async function deletePlayer(name) {
  // Throws if invalid
  validateUtils.isNameValid(name);

  try {
      let result = await playersCollection.deleteOne({name: name});
      if(result.deletedCount >= 1) {
          return true;
      } else {
          // Will get rethrown.
          throw new InvalidInputError('Player could not be found in database.');
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

module.exports = {
  getCollection,
  close,
  addPlayer,
  updatePlayer,
  getSinglePlayerbyName,
  getAllPlayers,
  deletePlayer,
  initialize,
};
