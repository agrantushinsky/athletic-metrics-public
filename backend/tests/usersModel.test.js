require('dotenv').config();

const model = require('../models/usersModel');

const logger = require('../logger');

const { InvalidInputError } = require('../models/InvalidInputError');
const { MongoMemoryServer } = require('mongodb-memory-server');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const dbName = "users_test_db";

const exampleUsers = [
    { username: "admin", password: "bestpassword12345", administrator: true },
    { username: "user", password: "yeahokaythisisapassword!", administrator: false },
    { username: "someguy", password: "29832478dsuhf", administrator: false },
];

function generateUser() {
    return exampleUsers[Math.floor(Math.random() * exampleUsers.length)];
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

// ======================================
// Create
// ======================================
test("Add single user to database", async () => {
    const {username, password, administrator} = generateUser();

    await model.addUser(username, password, administrator);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(username == results[0].username).toBe(true);
    expect(administrator == results[0].administrator).toBe(true);
    expect(await bcrypt.compare(password, results[0].password)).toBe(true);
});

test("Add multiple users to database", async () => {
    const user1 = JSON.parse( JSON.stringify( generateUser()));
    const user2 = generateUser();
    user2.username += "noduplicate";
    user1.username += "abcasdf";

    await model.addUser(user1.username, user1.password, user1.administrator);
    await model.addUser(user2.username, user2.password, user2.administrator);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);

    expect(user1.username == results[0].username).toBe(true);
    expect(user1.administrator == results[0].administrator).toBe(true);
    expect(await bcrypt.compare(user1.password, results[0].password)).toBe(true);

    expect(user2.username == results[1].username).toBe(true);
    expect(user2.administrator == results[1].administrator).toBe(true);
    expect(await bcrypt.compare(user2.password, results[1].password)).toBe(true);
});

test("Adding user with invalid username", async () => {
    const {username, password, administrator} = {
        username: "george12314234!!#@!4",
        password: "123455676657567656756",
        administrator: true
    };

    expect(() => model.addUser(username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Adding user with duplicate username", async () => {
    const user1 = generateUser();
    await model.addUser(user1.username, user1.password, user1.administrator);

    expect(() => model.addUser(user1.username, user1.password, user1.administrator).rejects.toThrow(InvalidInputError));
});

test("Adding user with invalid password", async () => {
    const {username, password, administrator} = {
        username: "george",
        password: "short",
        administrator: true
    };

    expect(() => model.addUser(username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Adding user with invalid administrator", async () => {
    const {username, password, administrator} = {
        username: "george",
        password: "long23847328947329748",
        administrator: "notaboolean"
    };

    expect(() => model.addUser(username, password, administrator).rejects.toThrow(InvalidInputError));
});

// ======================================
// Read
// ======================================
test("Finding single user by name", async () => {
    const {username, password, administrator} = generateUser();

    await forceAddUser(username, password, administrator);

    const result = await model.getSingleUserByName(username);

    expect(username == result.username).toBe(true);
    expect(administrator == result.administrator).toBe(true);
    expect(await bcrypt.compare(password, result.password)).toBe(true);
});

test("Finding single user by name with no matching name in database", async () => {
    const {username, password, administrator} = generateUser();
    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddUser(username, password, administrator);

    expect(() => model.getSingleUserByName(noMatchName).rejects.toThrow(InvalidInputError));
});

test("Finding single user by name with invalid username", async () => {
    const name =  "Th1s name is 1nval1d!!";

    expect(() => model.getSingleUserByName(name).rejects.toThrow(InvalidInputError));
});

test("Getting all users on empty database", async () => {
    const results = await model.getAllUsers();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Getting all users on non-empty database", async () => {
    const {username, password, administrator} = generateUser();

    await forceAddUser(username, password, administrator);

    const results = await model.getAllUsers();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
});

// ======================================
// Update
// ======================================
test("Updating an existing user with valid data", async () => {
    const {username, password, administrator} = generateUser();
    const updatedUser = generateUser();
    updatedUser.username += "noduplicate";

    await forceAddUser(username, password, administrator);
    await model.updateUser(username, updatedUser.username, updatedUser.password, updatedUser.administrator);

    const results = await model.getAllUsers();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedUser.username == results[0].username).toBe(true);
    expect(updatedUser.administrator == results[0].administrator).toBe(true);
    expect(await bcrypt.compare(updatedUser.password, results[0].password)).toBe(true);
});

test("Updating user with invalid originalUserName", async () => {
    const targetName = "Th1s name is 1nval1d!!";
    const {username, password, administrator} = {
        username: "george",
        password: "123455676657567656756",
        administrator: true
    };

    expect(() => model.updateUser(targetName, username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Updating user with invalid username", async () => {
    const targetName = "ValidTargetName";
    const {username, password, administrator} = {
        username: "george234923y4&*^!*%876%23",
        password: "123455676657567656756",
        administrator: true
    };

    expect(() => model.updateUser(targetName, username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Updating user with invalid password", async () => {
    const targetName = "ValidTargetName";
    const {username, password, administrator} = {
        username: "george",
        password: "short",
        administrator: true
    };

    expect(() => model.updateUser(targetName, username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Updating user with invalid administrator", async () => {
    const targetName = "ValidTargetName";
    const {username, password, administrator} = {
        username: "george",
        password: "long230945789823475",
        administrator: "notaboolean"
    };

    expect(() => model.updateUser(targetName, username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Updating user with duplicate username", async () => {
    const {username, password, administrator} = generateUser();

    await forceAddUser(username, password, administrator);

    expect(() => model.updateUser(username, username, password, administrator).rejects.toThrow(InvalidInputError));
});

test("Updating a user with no matches in database", async () => {
    const {username, password, administrator} = generateUser();
    const noMatchName = "ThisIsNotInTheDatabase";
    const updatedUser = generateUser();

    await forceAddUser(username, password, administrator);
    expect(() => model.updateUser(noMatchName, updatedUser.username, updatedUser.password, updatedUser.administrator).rejects.toThrow(InvalidInputError));
});

// ======================================
// Delete
// ======================================
test("Deleting a valid existing user", async () => {
    const {username, password, administrator} = generateUser();

    await forceAddUser(username, password, administrator);

    let results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Now that it has been verified that it was added, delete and check if it is gone.
    await model.deleteUser(username);

    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Deleting a user with an invalid username", async () => {
    const name = "Th1s name is 1nval1d!!";

    expect(() => model.deleteUser(name).rejects.toThrow(InvalidInputError));
});

test("Deleting a user with no matches in database", async () => {
    const {username, password, administrator} = generateUser();
    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddUser(username, password, administrator);
    expect(() => model.deleteUser(noMatchName).rejects.toThrow(InvalidInputError));
});