require('dotenv').config();

const model = require('../models/usersModel');
const supertest = require('supertest');
const app = require('../app');
const testRequest = supertest(app);

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { DatabaseError } = require('../models/DatabaseError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const dbName = "users_test_db";

const exampleUsers = [
    { username: "admin", password: "bestpassword12345", administrator: true },
    { username: "user", password: "yeahokaythisisapassword!", administrator: false },
    { username: "someguy", password: "29832478dsuhf", administrator: false },
];

const bcrypt = require('bcrypt');
const saltRounds = 10;

function generateUser() {
    return exampleUsers[Math.floor(Math.random() * exampleUsers.length)];
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
 * Inserts user object into database with no validation. Used for testing only.
 * 
 * @param {String} name of user
 * @param {boolean} isTeamBased  of user
 * @param {String} countryOfOrigin of user
 */
async function forceAddUser(username, password, administrator) {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    let newUser = { 
        username: username,
        password: hashedPassword,
        administrator: administrator
    }

    // Add the new user
    try {
        await model.getCollection().insertOne(newUser);
    } catch(err) {
        logger.error(`Failed to force insertOne into database. Error: ${err.message}`);
        throw new DatabaseError(`Fatal error occured when inserting into database. Error: ${err.message}`);
    }
}

/**
 * Retrievse all documents from the database and returns the result as an array.
 * 
 * @returns {object[]} users object array of all objects from database
 */
async function getAllDocuments() {
    // Get cursor
    let cursor = await model.getCollection().find();

    // Get all rows
    let users = await cursor.toArray();

    // Return the users
    return users;
}

// =================================
// GET
// =================================
/*
test("GET /users success case", async () => {
    const {username, password, administrator} = generateUser();

    await forceAddUser(username, password, administrator);

    // Send get single request
    const testResponse = await testRequest.get(`/users/${username}`).set('Cookie', [`sessionId=${adminCookie};`]);
    expect(testResponse.status).toBe(200);

    // Verify that the user in the database matches the one found.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(username == results[0].username).toBe(true);
    expect(administrator == results[0].administrator).toBe(true);
    expect(await bcrypt.compare(password, results[0].password)).toBe(true);
});


test("GET /users failure case (400 level bad input)", async () => {
    const name = "Th1sNameIsInvalid123(*@&($&%";
    const testResponse = await testRequest.get(`/users/${name}`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(400);
});

test("GET /users failure case (500 level database error)", async () => {
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Close database to trigger 500 level error
    await model.close();

    // Attempt to query the closed database (expecting 500 level error)
    const testResponse = await testRequest.get(`/users/${username}`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(500);
});

test("GET /users/get-all success case", async () => {
    // Force add a user
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Get all users
    const testResponse = await testRequest.get(`/users/get-all`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(200);

    // Make sure the user in the database matches the one added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(username == results[0].username).toBe(true);
    expect(administrator == results[0].administrator).toBe(true);
    expect(await bcrypt.compare(password, results[0].password)).toBe(true);
});

test("GET /users/get-all failure case (500 level database error)", async () => {
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Close database to trigger 500 level error
    await model.close();

    // GET users/get-all expecting a 500 level error
    const testResponse = await testRequest.get(`/users/get-all`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(500);
});
*/
// =================================
// POST
// =================================
test("POST /users success case", async () => {
    // Add a user using POST
    const {username, password, administrator} = generateUser();
    const testResponse = await testRequest.post('/users/register').send({
        username: username,
        password: password,
        administrator: administrator
    }).set('sessionId', adminCookie);

    expect(testResponse.status).toBe(200);

    // Verify the user was successfully added
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(username == results[0].username).toBe(true);
    expect(await bcrypt.compare(password, results[0].password)).toBe(true);
});

test("POST /users failure case (400 level bad input)", async () => {
    // Send request with an invalid name expecting a 400 level response.
    const testResponse = await testRequest.post('/users/register').send({
        username: "george",
        password: "short",
        administrator: false
    }).set('sessionId', adminCookie);

    expect(testResponse.status).toBe(400);
});

test("POST /users failure case (500 level database error)", async () => {
    // Close database to trigger 500 level error
    await model.close();

    // Attempt to add on closed database, expecting 500 level error.
    const {username, password, administrator} = generateUser();
    const testResponse = await testRequest.post('/users/register').send({
        username: username,
        password: password,
        administrator: administrator
    }).set('sessionId', adminCookie);

    expect(testResponse.status).toBe(500);
});
/** 
// =================================
// PUT
// =================================
test("PUT /users success case", async () => {
    // Add a user to start
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // PUT request to update a user.
    const updatedUser = generateUser();
    const testResponse = await testRequest.put('/users').send({
        originalName: name,
		newName: updatedUser.name,
		newIsTeamBased: updatedUser.isTeamBased,
        newCountryOfOrigin: updatedUser.countryOfOrigin
    }).set('sessionId', adminCookie);

    expect(testResponse.status).toBe(200);

    // Verify the user was properly updated.
    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedUser.name == results[0].name).toBe(true);
    expect(updatedUser.isTeamBased == results[0].isTeamBased).toBe(true);
    expect(updatedUser.countryOfOrigin == results[0].countryOfOrigin).toBe(true);
});

test("PUT /users failure case (400 level bad input)", async () => {
    // Force add a user
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Attempt to update with an invalid newIsTeamBased (non-boolean), expecting 400 level error.
    const testResponse = await testRequest.put('/users').send({
        oldUsername: username,
        username: "bob",
        password: "short",
        administrator: false
    }).set('sessionId', adminCookie);

    expect(testResponse.status).toBe(400);
});

test("PUT /users failure case (500 level database error)", async () => {
    // Force add a user
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Close database to trigger a 500 level error later.
    await model.close();

    // Attempt to update the user, expecting a 500 level error.
    const updatedUser = generateUser();
    const testResponse = await testRequest.put('/users').send({
        oldUsername: username,
        username: updatedUser.username,
        password: updatedUser.password,
        administrator: updatedUser.administrator
    }).set('sessionId', adminCookie);

    expect(testResponse.status).toBe(500);
});

// =================================
// DELETE
// =================================
test("DELETE /users success case", async () => {
    // Force add a user
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Verify it was added
    let results = await getAllDocuments();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
    
    // DELETE request to remove the user
    const testResponse = await testRequest.delete(`/users/${username}`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(200);

    // Verify it was deleted.
    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("DELETE /users failure case (400 level bad input)", async () => {
    // Attempt to delete a user while sending an invalid name, expecting a 400 level response.
    const name = "Th1sNameIsInvalid123";
    const testResponse = await testRequest.delete(`/users/${name}`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(400);
});

test("DELETE /users failure case (500 level database error)", async () => {
    // Force add a user
    const {username, password, administrator} = generateUser();
    await forceAddUser(username, password, administrator);

    // Close the database to trigger a 500 level error.
    await model.close();

    // Attempt to delete, expecting a 500 level error.
    const testResponse = await testRequest.delete(`/users/${username}`).set('sessionId', adminCookie);
    expect(testResponse.status).toBe(500);
});
*/