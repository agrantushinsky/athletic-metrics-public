require('dotenv').config();

const model = require('../models/teamsModel');

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbName = "player_test_db";

const exampleTeams = [
    {  name: "Lakers", sport: "Basketball", countryOfOrigin: 'France' },
    {  name: "Raptors", sport: "Basketball", countryOfOrigin: 'Canada' },
    {  name: "Knicks", sport: "Basketball", countryOfOrigin: 'Germany' },
];

function generateTeam() {
    return exampleTeams[Math.floor(Math.random() * exampleTeams.length)];
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
async function forceAddTeam(name, sport, countryOfOrigin) {
    let newTeam = { 
        name: name, 
        sport: sport,  
        countryOfOrigin: countryOfOrigin
    }

    // Add the new player
    try {
        await model.getCollection().insertOne(newTeam);
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
    let teams = await cursor.toArray();

    // Return the players
    return teams;
}

// ======================================
// Create
// ======================================
test("Add single team to database", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();

    await model.addTeam(name, sport, countryOfOrigin);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(sport == results[0].sport).toBe(true);
    expect(countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("Add multiple teams to database", async () => {
    const team1 = generateTeam();
    const team2 = generateTeam();

    await model.addTeam(team1.name, team1.sport, team1.countryOfOrigin);
    await model.addTeam(team2.name, team2.sport, team2.countryOfOrigin);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);

    expect(team1.name == results[0].name).toBe(true);
    expect(team1.sport == results[0].sport).toBe(true);
    expect(team1.countryOfOrigin == results[0].countryOfOrigin).toBe(true);

    expect(team2.name == results[1].name).toBe(true);
    expect(team2.sport == results[1].sport).toBe(true);
    expect(team2.countryOfOrigin == results[1].countryOfOrigin).toBe(true);
});

test("Adding team with invalid name", async () => {
    const { name, sport, countryOfOrigin } = {
        name: "Th1s 1s an 1nvalid n4me", 
        sport: "Basketball", 
        countryOfOrigin: 'Canada'
    };

    expect(() => model.addTeam( name, sport, countryOfOrigin ).rejects.toThrow(InvalidInputError));
});


test("Adding player with invalid country", async () => {
    const { name, sport, countryOfOrigin } = {
        name: "Lakers", 
        sport: "Quiditch", 
        countryOfOrigin: 'Wyoming'
    };

    expect(() => model.addTeam( name, sport, countryOfOrigin ).rejects.toThrow(InvalidInputError));
});

test("Adding Team with invalid sport", async () => {
    const { name, sport, countryOfOrigin } = {
        name: "Lakers", 
        sport: "Quiditch", 
        countryOfOrigin: 'Canada'
    };

    expect(() => model.addTeam( name, sport, countryOfOrigin ).rejects.toThrow(InvalidInputError));
});

// ======================================
// Read
// ======================================
test("Finding single team by name", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();

    await forceAddTeam(name, sport, countryOfOrigin);

    const result = await model.getSingleTeamByName(name);

    expect(name == result.name).toBe(true);
    expect(sport == result.sport).toBe(true);
    expect(countryOfOrigin == result.countryOfOrigin).toBe(true);
});

test("Finding single team by name with no matching name in database", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();
    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddTeam(name, sport, countryOfOrigin);

    expect(() => model.getSingleTeamByName(noMatchName).rejects.toThrow(InvalidInputError));
});

test("Finding single team by name with invalid name", async () => {
    const name =  "Th1s name is 1nval1d!!";

    expect(() => model.getSingleTeamByName(name).rejects.toThrow(InvalidInputError));
});

test("Getting all teams on empty database", async () => {
    const results = await model.getAllTeams();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Getting all teams on non-empty database", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();

    await forceAddTeam(name, sport, countryOfOrigin);

    const results = await model.getAllTeams();


    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
});

// ======================================
// Update
// ======================================
test("Updating an existing team with valid data", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();
    const updatedTeam = generateTeam();

    await forceAddTeam(name, sport, countryOfOrigin);
    await model.updateTeam(name, updatedTeam.name, updatedTeam.sport, updatedTeam.countryOfOrigin);

    const results = await model.getAllTeams();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedTeam.name == results[0].name).toBe(true);
    expect(updatedTeam.sport == results[0].sport).toBe(true);
    expect(updatedTeam.countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("Updating team with invalid originalName", async () => {
    const targetName = "Th1s name is 1nval1d!";
    const { name, sport, countryOfOrigin } = {
        name: "Lakers", 
        sport: "Basketball", 
        countryOfOrigin: 'Canada'
    };

    expect(() => model.updateTeam(targetName, name, sport, countryOfOrigin).rejects.toThrow(InvalidInputError));
});

test("Updating team with invalid name", async () => {
    const targetName = "Valid";
    const { name, sport, countryOfOrigin } = {
        name: "Th1s name is 1nval1d!", 
        sport: "Basketball", 
        countryOfOrigin: 'Canada'
    };

    expect(() => model.updateTeam(targetName, name, sport, countryOfOrigin).rejects.toThrow(InvalidInputError));
});

test("Updating team with invalid country", async () => {
    const targetName = "Valid";
    const { name, sport, countryOfOrigin } = {
        name: "Lakers", 
        sport: "Basketball", 
        countryOfOrigin: 'Wyoming'
    };

    expect(() => model.updateTeam(targetName, name, sport, countryOfOrigin).rejects.toThrow(InvalidInputError));
});

test("Updating player with invalid sport", async () => {
    const targetName = "Valid";
    const { name, sport, countryOfOrigin } = {
        name: "Lakers", 
        sport: "Quiditch", 
        countryOfOrigin: 'Canada'
    };

    expect(() => model.updateTeam(targetName, name, sport, countryOfOrigin).rejects.toThrow(InvalidInputError));
});

test("Updating a player with no matches in database", async () => {
    const { name, sport, countryOfOrigin } = generateTeam();
    const noMatchName = "ThisIsNotInTheDatabase";
    const updatedTeam = generateTeam();

    await forceAddTeam(name, sport, countryOfOrigin);
    expect(() => model.updateTeam(noMatchName, updatedTeam.name, updatedTeam.sport, updatedTeam.countryOfOrigin).rejects.toThrow(InvalidInputError));
});

// ======================================
// Delete
// ======================================
test("Deleting a valid existing team", async () => {
    const { name, sport, countryOfOrigin } = generateTeam();

    await forceAddTeam(name, sport, countryOfOrigin);

    let results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Now that it has been verified that it was added, delete and check if it is gone.
    await model.deleteTeam(name);

    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Deleting a team with an invalid name", async () => {
    const name = "Th1s name is 1nval1d!!";

    expect(() => model.deleteTeam(name).rejects.toThrow(InvalidInputError));
});

test("Deleting a team with no matches in database", async () => {
    const { name, sport, countryOfOrigin } = generateTeam();

    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddTeam(name, sport, countryOfOrigin);
    expect(() => model.deleteTeam(noMatchName).rejects.toThrow(InvalidInputError));
});