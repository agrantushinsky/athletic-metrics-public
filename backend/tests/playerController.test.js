require('dotenv').config();

const model = require('../models/playerModel');
const supertest = require('supertest');
const app = require('../app');
const testRequest = supertest(app);

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbName = "players_test_db";

const examplePlayers = [
    {  name: "George", team: "Spain", age: 25, points: 32, },
    {  name: "Walter", team: "Columbia", age: 22, points: 50, },
    {  name: "Saul", team: "Canada", age: 52, points: 75, },
];

function generatePlayer() {
    return examplePlayers[Math.floor(Math.random() * examplePlayers.length)];
}

const { createSession } = require("../controllers/Session");
var mongodb;
var adminCookie;
/**
 * Initializes the database connection and wipes out the collection 
 * (hence the third argument: "true" being passed to model.initialize(...)).
 */
beforeEach(async () => {
    jest.setTimeout(5000);
    adminCookie = createSession("admin", 60, true);

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
async function forceAddPlayer(name, team, age, points) {
    let newPlayer = { 
        name: name, 
        team: team,
        age: age,
        points: points,
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

// =================================
// GET
// =================================
test("GET /players success case", async () => {
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);

    // Send get single request
    const testResponse = await testRequest.get(`/players/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify that the player in the database matches the one found.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(age == results[0].age).toBe(true);
    expect(team == results[0].team).toBe(true);
    expect(points == results[0].points).toBe(true);
});

test("GET /players failure case (400 level bad input)", async () => {
    const badName = "12sdadf";
    const testResponse = await testRequest.get(`/players/${badName}`);
    expect(testResponse.status).toBe(400);
});

test("GET /players failure case (500 level database error)", async () => {
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);
    // Close database to trigger 500 level error
    await model.close();

    // Attempt to query the closed database (expecting 500 level error)
    const testResponse = await testRequest.get(`/players/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});

test("GET /players/get-all success case", async () => {
    // Force add a player
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);

    // Get all players
    const testResponse = await testRequest.get(`/players/get-all`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Make sure the player in the database matches the one added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(age == results[0].age).toBe(true);
    expect(points == results[0].points).toBe(true);
    expect(team == results[0].team).toBe(true);
});

test("GET /players/get-all failure case (500 level database error)", async () => {
    const { date, winningTeam, losingTeam,rating } = generatePlayer();
    await forceAddPlayer(date, winningTeam, losingTeam,rating);

    // Close database to trigger 500 level error
    await model.close();

    // GET players/get-all expecting a 500 level error
    const testResponse = await testRequest.get(`/players/get-all`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});

// =================================
// POST
// =================================
test("POST /players success case", async () => {
    // Add a player using POST
    const { name, team, age,points } = generatePlayer();
    const testResponse = await testRequest.post('/players').send({
        name: name, team: team, age: age, points: points
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(200);

    // Verify the player was successfully added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(age == results[0].age).toBe(true);
    expect(team == results[0].team).toBe(true);
    expect(points == results[0].points).toBe(true);
});

test("POST /players failure case (400 level bad input)", async () => {
    // Send request with an invalid name expecting a 400 level response.
    const testResponse = await testRequest.post('/players').send({
        name: "200-023-00",
        age: "WinningTeam",
        points: "Fiji",
        team: 15
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(400);
});

test("POST /players failure case (500 level database error)", async () => {
    // Close database to trigger 500 level error
    await model.close();

    // Attempt to add on closed database, expecting 500 level error.
    const { name, team, age,points } = generatePlayer();
    const testResponse = await testRequest.post('/players').send({
        name: name,
        team: team,
        age: age,
        points: points
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(500);
});

// =================================
// PUT
// =================================
test("PUT /players success case", async () => {
    // Add a player to start
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);

    // PUT request to update a player.
    const updatedPlayer = generatePlayer();
    const testResponse = await testRequest.put('/players').send({
        originalName: name,
        name: updatedPlayer.name,
        team: updatedPlayer.team,
        age: updatedPlayer.age,
        points: updatedPlayer.points
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(200);

    // Verify the player was properly updated.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedPlayer.name == results[0].name).toBe(true);
    expect(updatedPlayer.team == results[0].team).toBe(true);
    expect(updatedPlayer.age == results[0].age).toBe(true);
    expect(updatedPlayer.points == results[0].points).toBe(true);
});

test("PUT /players failure case (400 level bad input)", async () => {
    // Force add a player
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);

    const updatedPlayer = generatePlayer();

    // Attempt to update with an invalid newIsTeamBased (non-boolean), expecting 400 level error.
    const testResponse = await testRequest.put('/players').send({
        originalName: "221fewf",
        name: updatedPlayer.name,
        team: updatedPlayer.team,
        age: updatedPlayer.points,
        points: updatedPlayer.points
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(400);
});

test("PUT /players failure case (500 level database error)", async () => {
    // Force add a player
    const { date, winningTeam, losingTeam,rating } = generatePlayer();
    await forceAddPlayer(date, winningTeam, losingTeam,rating);

    // Close database to trigger a 500 level error later.
    await model.close();

    // Attempt to update the player, expecting a 500 level error.
    const updatedPlayer = generatePlayer();
    const testResponse = await testRequest.put('/players').send({
        targetDate: date,
        targetTeam: winningTeam,
        winningTeam: updatedPlayer.winningTeam,
        losingTeam: updatedPlayer.losingTeam,
        date: updatedPlayer.date,
        rating: updatedPlayer.rating
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(500);
});

// =================================
// DELETE
// =================================
test("DELETE /players success case", async () => {
    // Force add a player
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);

    // Verify it was added
    let results = await getAllDocuments();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    
    // DELETE request to remove the player
    const testResponse = await testRequest.delete(`/players/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify it was deleted.
    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("DELETE /players failure case (400 level bad input)", async () => {
    // Attempt to delete a player while sending an invalid name, expecting a 400 level response.
    const testResponse = await testRequest.delete(`/players/1332`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(400);
});

test("DELETE /players failure case (500 level database error)", async () => {
    // Force add a player
    const { name, team, age,points } = generatePlayer();
    await forceAddPlayer(name, team, age,points);

    // Close the database to trigger a 500 level error.
    await model.close();

    // Attempt to delete, expecting a 500 level error.
    const testResponse = await testRequest.delete(`/players/${name}/`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});