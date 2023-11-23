require('dotenv').config();

const model = require('../models/playerModel');

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbName = "player_test_db";

const examplePlayers = [
    {  name: "George", team: "Spain", age: 25, points: 32, },
    {  name: "Walter", team: "Columbia", age: 22, points: 50, },
    {  name: "Saul", team: "Canada", age: 52, points: 75, },
];

function generatePlayer() {
    return examplePlayers[Math.floor(Math.random() * examplePlayers.length)];
}

var mongodb;
/**
 * Initializes the database connection and wipes out the collection 
 * (hence the third argument: "true" being passed to model.initialize(...)).
 */
beforeEach(async () => {
    jest.setTimeout(5000);

    try {
        await model.initialize(dbName, mongodb.getUri(), true);
    } catch (err) { 
        logger.error(err.message);
    }
});

afterEach(async () => {
    await model.close();
});

beforeAll(async () => {
    mongodb = await MongoMemoryServer.create();
    logger.info("Mock Database Started!");
});

afterAll(async () => { 
    await mongodb.stop();
    logger.info("Mock Database Stopped.");
});

// ======================================
// Helpers
// ======================================
/**
 * Inserts player object into database with no validation. Used for testing only.
 * 
 * @param {String} name of player
 * @param {boolean} isTeamBased  of player
 * @param {String} countryOfOrigin of player
 */
async function forceAddPlayer(name, points, team, age) {
    let newPlayer = { 
        name: name, 
        team: team,
        age: age,
        points:points,
    }

    // Add the new player
    try {
        await model.getCollection().insertOne(newPlayer);
    } catch(err) {
        logger.error(`Failed to force insertOne into database. Error: ${err.message}`);
        throw new DatabaseError(`Fatal error occured when inserting into database. Error: ${err.message}`);
    }
}

/**
 * Retrievse all documents from the database and returns the result as an array.
 * 
 * @returns {object[]} players object array of all objects from database
 */
async function getAllDocuments() {
    // Get cursor
    let cursor = await model.getCollection().find();

    // Get all rows
    let players = await cursor.toArray();

    // Return the players
    return players;
}

// ======================================
// Create
// ======================================
test("Add single player to database", async () => {
    const {name, points, team, age} = generatePlayer();

    await model.addPlayer(name, points, team, age);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(team == results[0].team).toBe(true);
    expect(age == results[0].age).toBe(true);
    expect(points == results[0].points).toBe(true);
});

test("Add multiple players to database", async () => {
    const player1 = generatePlayer();
    const player2 = generatePlayer();

    await model.addPlayer(player1.name, player1.points, player1.team, player1.age);
    await model.addPlayer(player2.name, player2.points, player2.team, player2.age);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);

    expect(player1.name == results[0].name).toBe(true);
    expect(player1.team == results[0].team).toBe(true);
    expect(player1.age == results[0].age).toBe(true);
    expect(player1.points == results[0].points).toBe(true);

    expect(player2.name == results[1].name).toBe(true);
    expect(player2.team == results[1].team).toBe(true);
    expect(player2.age == results[1].age).toBe(true);
    expect(player2.points == results[1].points).toBe(true);
});

test("Adding player with invalid name", async () => {
    const { name, points, team, age } = {
        name: "Th1s name is 1nval1d!!",
        team: "Spain",
        age: 25,
        points: 20
    };

    expect(() => model.addPlayer( name, points, team, age ).rejects.toThrow(InvalidInputError));
});

test("Adding player with invalid points", async () => {
    const { name, points, team, age } = {
        name: "George",
        team: "Spain",
        age: 25,
        points: "a"
    };

    expect(() => model.addPlayer( name, points, team, age ).rejects.toThrow(InvalidInputError));
});

test("Adding player with invalid team", async () => {
    const { name, points, team, age } = {
        name: "George",
        team: "Spain3245348795 asdf98y",
        age: 25,
        points: "a"
    };

    expect(() => model.addPlayer( name, points, team, age ).rejects.toThrow(InvalidInputError));
});

test("Adding player with invalid age", async () => {
    const { name, points, team, age } = {
        name: "George",
        team: "Spain",
        age: "a",
        points: 25
    };

    expect(() => model.addPlayer( name, points, team, age ).rejects.toThrow(InvalidInputError));
});

// ======================================
// Read
// ======================================
test("Finding single player by name", async () => {
    const { name, points, team, age } = generatePlayer();

    await forceAddPlayer(name, points, team, age);

    const result = await model.getSinglePlayerbyName(name);

    expect(name == result.name).toBe(true);
    expect(team == result.team).toBe(true);
    expect(age == result.age).toBe(true);
    expect(points == result.points).toBe(true);
});

test("Finding single player by name with no matching name in database", async () => {
    const { name, points, team, age } = generatePlayer();
    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddPlayer(name, points, team, age);

    expect(() => model.getSinglePlayerbyName(noMatchName).rejects.toThrow(InvalidInputError));
});

test("Finding single player by name with invalid name", async () => {
    const name =  "Th1s name is 1nval1d!!";

    expect(() => model.getSinglePlayerbyName(name).rejects.toThrow(InvalidInputError));
});

test("Getting all players on empty database", async () => {
    const results = await model.getAllPlayers();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Getting all players on non-empty database", async () => {
    const { name, points, team, age } = generatePlayer();

    await forceAddPlayer(name, points, team, age);

    const results = await model.getAllPlayers();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
});

// ======================================
// Update
// ======================================
test("Updating an existing player with valid data", async () => {
    const { name, points, team, age } = generatePlayer();
    const updatedPlayer = generatePlayer();

    await forceAddPlayer(name, points, team, age);
    await model.updatePlayer(name, updatedPlayer.name, updatedPlayer.team, updatedPlayer.age, updatedPlayer.points);

    const results = await model.getAllPlayers();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedPlayer.name == results[0].name).toBe(true);
    expect(updatedPlayer.team == results[0].team).toBe(true);
    expect(updatedPlayer.age == results[0].age).toBe(true);
    expect(updatedPlayer.points == results[0].points).toBe(true);
});

test("Updating player with invalid originalName", async () => {
    const targetName = "Th1s name is 1nval1d!!";
    const { name, points, team, age } = {
        name: "Valid",
        team: "Spain",
        age: 25,
        points: 20
    };

    expect(() => model.updatePlayer(targetName, name, team, age, points).rejects.toThrow(InvalidInputError));
});

test("Updating player with invalid name", async () => {
    const targetName = "Valid";
    const { name, points, team, age } = {
        name: "Th1s name is 1nval1d!!",
        team: "Spain",
        age: 25,
        points: 20
    };

    expect(() => model.updatePlayer(targetName, name, team, age, points).rejects.toThrow(InvalidInputError));
});

test("Updating player with invalid points", async () => {
    const targetName = "Valid";
    const { name, points, team, age } = {
        name: "Valid",
        team: "Spain",
        age: 25,
        points: "a"
    };

    expect(() => model.updatePlayer(targetName, name, team, age, points).rejects.toThrow(InvalidInputError));
});

test("Updating player with invalid team", async () => {
    const targetName = "Valid";
    const { name, points, team, age } = {
        name: "Valid",
        team: "asdfsl98s8723!",
        age: 25,
        points: 11
    };

    expect(() => model.updatePlayer(targetName, name, team, age, points).rejects.toThrow(InvalidInputError));
});

test("Updating player with invalid age", async () => {
    const targetName = "Valid";
    const { name, points, team, age } = {
        name: "Valid",
        team: "Spain",
        age: "a",
        points: 11
    };

    expect(() => model.updatePlayer(targetName, name, team, age, points).rejects.toThrow(InvalidInputError));
});

test("Updating a player with no matches in database", async () => {
    const { name, points, team, age } = generatePlayer();
    const noMatchName = "ThisIsNotInTheDatabase";
    const updatedPlayer = generatePlayer();

    await forceAddPlayer(name, points, team, age);
    expect(() => model.updatePlayer(noMatchName, updatedPlayer.name, updatedPlayer.team, updatedPlayer.age, updatedPlayer.points).rejects.toThrow(InvalidInputError));
});

// ======================================
// Delete
// ======================================
test("Deleting a valid existing player", async () => {
    const { name, points, team, age } = generatePlayer();

    await forceAddPlayer(name, points, team, age);

    let results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Now that it has been verified that it was added, delete and check if it is gone.
    await model.deletePlayer(name);

    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Deleting a player with an invalid name", async () => {
    const name = "Th1s name is 1nval1d!!";

    expect(() => model.deletePlayer(name).rejects.toThrow(InvalidInputError));
});

test("Deleting a player with no matches in database", async () => {
    const { name, points, team, age } = generatePlayer();
    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddPlayer(name, points, team, age);
    expect(() => model.deletePlayer(noMatchName).rejects.toThrow(InvalidInputError));
});