require('dotenv').config();

const model = require('../models/gamesModel');
const supertest = require('supertest');
const app = require('../app');
const testRequest = supertest(app);

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbName = "games_test_db";

const exampleGames = [
    { date: '2004-05-12', winningTeam: "Pk", losingTeam: 'ABC', rating: 5 },
    { date: '2002-15-02', winningTeam: "JonnysTeam", losingTeam: 'United States of America', rating: 55 },
    { date: '2019-04-15', winningTeam: "TeamJesus", losingTeam: 'TeamUkraine', rating: 99 },
];

function generateGame() {
    return exampleGames[Math.floor(Math.random() * exampleGames.length)];
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
 * Inserts game object into database with no validation. Used for testing only.
 * 
 * @param {String} name of game
 * @param {boolean} isTeamBased  of game
 * @param {String} countryOfOrigin of game
 */
async function forceAddGame(date, winningTeam, losingTeam, rating) {
    let newGame = { 
        date: date, 
        winningTeam: winningTeam,
        losingTeam: losingTeam,
        rating: rating
    }

    // Add the new game
    try {
        await model.getCollection().insertOne(newGame);
    } catch(err) {
        logger.error(`Failed to force insertOne into database. Error: ${err.message}`);
        throw new DatabaseError(`Fatal error occured when inserting into database. Error: ${err.message}`);
    }
}

/**
 * Retrievse all documents from the database and returns the result as an array.
 * 
 * @returns {object[]} games object array of all objects from database
 */
async function getAllDocuments() {
    // Get cursor
    let cursor = await model.getCollection().find();

    // Get all rows
    let games = await cursor.toArray();

    // Return the games
    return games;
}

// =================================
// GET
// =================================
test("GET /games success case", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Send get single request
    const testResponse = await testRequest.get(`/games/${winningTeam}/${date}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify that the game in the database matches the one found.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(date == results[0].date).toBe(true);
    expect(rating == results[0].rating).toBe(true);
    expect(losingTeam == results[0].losingTeam).toBe(true);
    expect(winningTeam == results[0].winningTeam).toBe(true);
});

test("GET /games failure case (400 level bad input)", async () => {
    const badDate = "2022-aa-bb";
    const testResponse = await testRequest.get(`/games/Spain/${badDate}`);
    expect(testResponse.status).toBe(400);
});

test("GET /games failure case (500 level database error)", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Close database to trigger 500 level error
    await model.close();

    // Attempt to query the closed database (expecting 500 level error)
    const testResponse = await testRequest.get(`/games/${winningTeam}/${date}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});

test("GET /games/get-all success case", async () => {
    // Force add a game
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Get all games
    const testResponse = await testRequest.get(`/games/get-all`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Make sure the game in the database matches the one added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(date == results[0].date).toBe(true);
    expect(rating == results[0].rating).toBe(true);
    expect(losingTeam == results[0].losingTeam).toBe(true);
    expect(winningTeam == results[0].winningTeam).toBe(true);
});

test("GET /games/get-all failure case (500 level database error)", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Close database to trigger 500 level error
    await model.close();

    // GET games/get-all expecting a 500 level error
    const testResponse = await testRequest.get(`/games/get-all`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});

// =================================
// POST
// =================================
test("POST /games success case", async () => {
    // Add a game using POST
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const testResponse = await testRequest.post('/games').send({
        date: date, winningTeam: winningTeam, losingTeam: losingTeam, rating: rating
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(200);

    // Verify the game was successfully added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(date == results[0].date).toBe(true);
    expect(rating == results[0].rating).toBe(true);
    expect(losingTeam == results[0].losingTeam).toBe(true);
    expect(winningTeam == results[0].winningTeam).toBe(true);
});

test("POST /games failure case (400 level bad input)", async () => {
    // Send request with an invalid name expecting a 400 level response.
    const testResponse = await testRequest.post('/games').send({
        date: "200-023-00",
        winningTeam: "WinningTeam",
        losingTeam: "Fiji",
        rating: 15
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(400);
});

test("POST /games failure case (500 level database error)", async () => {
    // Close database to trigger 500 level error
    await model.close();

    // Attempt to add on closed database, expecting 500 level error.
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const testResponse = await testRequest.post('/games').send({
        date: date,
        winningTeam: winningTeam,
        losingTeam: losingTeam,
        rating: rating
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(500);
});

// =================================
// PUT
// =================================
test("PUT /games success case", async () => {
    // Add a game to start
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // PUT request to update a game.
    const updatedGame = generateGame();
    const testResponse = await testRequest.put('/games').send({
        targetDate: date,
        targetTeam: winningTeam,
        winningTeam: updatedGame.winningTeam,
        losingTeam: updatedGame.losingTeam,
        date: updatedGame.date,
        rating: updatedGame.rating
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(200);

    // Verify the game was properly updated.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedGame.date == results[0].date).toBe(true);
    expect(updatedGame.rating == results[0].rating).toBe(true);
    expect(updatedGame.losingTeam == results[0].losingTeam).toBe(true);
    expect(updatedGame.winningTeam == results[0].winningTeam).toBe(true);
});

test("PUT /games failure case (400 level bad input)", async () => {
    // Force add a game
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    const updatedGame = generateGame();

    // Attempt to update with an invalid newIsTeamBased (non-boolean), expecting 400 level error.
    const testResponse = await testRequest.put('/games').send({
        targetDate: date,
        targetTeam: winningTeam,
        winningTeam: updatedGame.winningTeam,
        losingTeam: updatedGame.losingTeam,
        date: "2022-aa-bb",
        rating: updatedGame.rating
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(400);
});

test("PUT /games failure case (500 level database error)", async () => {
    // Force add a game
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Close database to trigger a 500 level error later.
    await model.close();

    // Attempt to update the game, expecting a 500 level error.
    const updatedGame = generateGame();
    const testResponse = await testRequest.put('/games').send({
        targetDate: date,
        targetTeam: winningTeam,
        winningTeam: updatedGame.winningTeam,
        losingTeam: updatedGame.losingTeam,
        date: updatedGame.date,
        rating: updatedGame.rating
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(500);
});

// =================================
// DELETE
// =================================
test("DELETE /games success case", async () => {
    // Force add a game
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Verify it was added
    let results = await getAllDocuments();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    
    // DELETE request to remove the game
    const testResponse = await testRequest.delete(`/games/${date}/${winningTeam}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify it was deleted.
    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("DELETE /games failure case (400 level bad input)", async () => {
    // Attempt to delete a game while sending an invalid name, expecting a 400 level response.
    const testResponse = await testRequest.delete(`/games/Spain/2022-aa-bb`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(400);
});

test("DELETE /games failure case (500 level database error)", async () => {
    // Force add a game
    const { date, winningTeam, losingTeam,rating } = generateGame();
    await forceAddGame(date, winningTeam, losingTeam,rating);

    // Close the database to trigger a 500 level error.
    await model.close();

    // Attempt to delete, expecting a 500 level error.
    const testResponse = await testRequest.delete(`/games/${date}/${winningTeam}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});