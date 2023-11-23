require('dotenv').config();

const model = require('../models/teamsModel');
const supertest = require('supertest');
const app = require('../app');
const testRequest = supertest(app);

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbName = "teams_test_db";

const exampleTeams = [
    {  name: "Lakers", sport: "Basketball", countryOfOrigin: 'France' },
    {  name: "Raptors", sport: "Basketball", countryOfOrigin: 'Canada' },
    {  name: "Knicks", sport: "Basketball", countryOfOrigin: 'Germany' },
];

function generateTeam() {
    return exampleTeams[Math.floor(Math.random() * exampleTeams.length)];
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
 * Inserts team object into database with no validation. Used for testing only.
 * 
 * @param {String} name of team
 * @param {boolean} isTeamBased  of team
 * @param {String} countryOfOrigin of team
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
 * @returns {object[]} teams object array of all objects from database
 */
async function getAllDocuments() {
    // Get cursor
    let cursor = await model.getCollection().find();

    // Get all rows
    let teams = await cursor.toArray();

    // Return the players
    return teams;
}

// =================================
// GET
// =================================
test("GET /teams success case", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();

    await forceAddTeam(name, sport, countryOfOrigin);

    // Send get single request
    const testResponse = await testRequest.get(`/teams/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify that the team in the database matches the one found.
    const results = await getAllDocuments();

    expect(name == results[0].name).toBe(true);
    expect(sport == results[0].sport).toBe(true);
    expect(countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("GET /teams failure case (400 level bad input)", async () => {
    const badName = "Th1s 1s a b4d n4me";
    const testResponse = await testRequest.get(`/teams/${badName}`);
    expect(testResponse.status).toBe(400);
});

test("GET /teams failure case (500 level database error)", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // Close database to trigger 500 level error
    await model.close();

    // Attempt to query the closed database (expecting 500 level error)
    const testResponse = await testRequest.get(`/teams/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});

test("GET /teams/get-all success case", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // Get all teams
    const testResponse = await testRequest.get(`/teams/get-all`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Make sure the team in the database matches the one added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(sport == results[0].sport).toBe(true);
    expect(countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("GET /teams/get-all failure case (500 level database error)", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // Close database to trigger 500 level error
    await model.close();

    // GET teams/get-all expecting a 500 level error
    const testResponse = await testRequest.get(`/teams/get-all`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});

// =================================
// POST
// =================================
test("POST /teams success case", async () => {
    const {name, sport, countryOfOrigin} = generateTeam();
    const testResponse = await testRequest.post('/teams').send({
        name: name, sport: sport, countryOfOrigin: countryOfOrigin
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(200);

    // Verify the team was successfully added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(name == results[0].name).toBe(true);
    expect(sport == results[0].sport).toBe(true);
    expect(countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("POST /teams failure case (400 level bad input)", async () => {
    // Send request with an invalid name expecting a 400 level response.
    const testResponse = await testRequest.post('/teams').send({
        name: "Th1s 1s an 1nvalid n4me", 
        sport: "Basketball", 
        countryOfOrigin: 'United States'
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(400);
});

test("POST /teams failure case (500 level database error)", async () => {
    // Close database to trigger 500 level error
    await model.close();

    // Attempt to add on closed database, expecting 500 level error.
    const {name, sport, countryOfOrigin} = generateTeam();
    const testResponse = await testRequest.post('/teams').send({
        name: name, 
        sport: sport, 
        countryOfOrigin: countryOfOrigin
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(500);
});

// =================================
// PUT
// =================================
test("PUT /teams success case", async () => {
    // Add a team to start
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // PUT request to update a team.
    const updatedTeam = generateTeam();
    const testResponse = await testRequest.put('/teams').send({
        originalName: name,
        name: updatedTeam.name,
        sport: updatedTeam.sport,
        countryOfOrigin: updatedTeam.countryOfOrigin,
    }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(200);

    // Verify the team was properly updated.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedTeam.name == results[0].name).toBe(true);
    expect(updatedTeam.sport == results[0].sport).toBe(true);
    expect(updatedTeam.countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("PUT /teams failure case (400 level bad input)", async () => {
     // Add a team to start
     const {name, sport, countryOfOrigin} = generateTeam();
     await forceAddTeam(name, sport, countryOfOrigin);
 
     // PUT request to update a team.
     const updatedTeam = generateTeam();
     const testResponse = await testRequest.put('/teams').send({
         originalName: "Th1s 1s an inv4lid n4me",
         newName: updatedTeam.name,
         newSport: updatedTeam.sport,
         newCountryOfOrigin: updatedTeam.countryOfOrigin,
     }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(400);
});

test("PUT /teams failure case (500 level database error)", async () => {
    // Force add a team
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // Close database to trigger a 500 level error later.
    await model.close();

    // Attempt to update the team, expecting a 500 level error.
     // PUT request to update a team.
     const updatedTeam = generateTeam();
     const testResponse = await testRequest.put('/teams').send({
         originalName: name,
         newName: updatedTeam.name,
         newSport: updatedTeam.sport,
         newCountryOfOrigin: updatedTeam.countryOfOrigin,
     }).set('Cookie', [`sessionId=${adminCookie};`]);

    expect(testResponse.status).toBe(500);
});

// =================================
// DELETE
// =================================
test("DELETE /teams success case", async () => {
    // Force add a team
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // Verify it was added
    let results = await getAllDocuments();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    
    // DELETE request to remove the team
    const testResponse = await testRequest.delete(`/teams/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify it was deleted.
    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("DELETE /teams failure case (400 level bad input)", async () => {
    // Attempt to delete a team while sending an invalid name, expecting a 400 level response.
    const testResponse = await testRequest.delete(`/teams/1nval1dN4me`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(400);
});

test("DELETE /teams failure case (500 level database error)", async () => {
    // Force add a team
    const {name, sport, countryOfOrigin} = generateTeam();
    await forceAddTeam(name, sport, countryOfOrigin);

    // Close the database to trigger a 500 level error.
    await model.close();

    // Attempt to delete, expecting a 500 level error.
    const testResponse = await testRequest.delete(`/teams/${name}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(500);
});