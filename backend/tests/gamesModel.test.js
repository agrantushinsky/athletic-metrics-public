require('dotenv').config();

const model = require('../models/gamesModel');

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

// ======================================
// Create
// ======================================
test("Add single game to database", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();

    await model.addGames(date, winningTeam, losingTeam,rating);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(date == results[0].date).toBe(true);
    expect(rating == results[0].rating).toBe(true);
    expect(losingTeam == results[0].losingTeam).toBe(true);
    expect(winningTeam == results[0].winningTeam).toBe(true);
});

test("Add multiple games to database", async () => {
    const game1 = generateGame();
    const game2 = generateGame();

    await model.addGames(game1.date, game1.winningTeam, game1.losingTeam, game1.rating);
    await model.addGames(game2.date, game2.winningTeam, game2.losingTeam, game2.rating);
    const results = await getAllDocuments();
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(2);

    expect(game1.date == results[0].date).toBe(true);
    expect(game1.winningTeam == results[0].winningTeam).toBe(true);
    expect(game1.losingTeam == results[0].losingTeam).toBe(true);
    expect(game1.rating == results[0].rating).toBe(true);

    expect(game2.date == results[1].date).toBe(true);
    expect(game2.winningTeam == results[1].winningTeam).toBe(true);
    expect(game2.rating == results[1].rating).toBe(true);
    expect(game2.losingTeam == results[1].losingTeam).toBe(true);
});

test("Adding game with invalid date", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "200-023-00",
        winningTeam: "WinningTeam",
        losingTeam: "Fiji",
        rating: 15
    };

    expect(() => model.addGames(date, winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});

test("Adding game with invalid winningTeam", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "2003-23-01",
        winningTeam: "This is baddddddd!!!!!",
        losingTeam: "Fiji",
        rating: 15
    };

    expect(() => model.addGames(date, winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});

test("Adding game with invalid losingTeam", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "2003-23-01",
        winningTeam: "John",
        losingTeam: "This is baddddddd!!!!!",
        rating: 15
    };

    expect(() => model.addGames(date, winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});

test("Adding game with invalid rating edgeCase testing #1", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "2003-23-01",
        winningTeam: "John",
        losingTeam: "This",
        rating: -1
    };

    expect(() => model.addGames(date, winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});
test("Adding game with invalid rating edgeCase testing #2", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "2003-23-01",
        winningTeam: "John",
        losingTeam: "This",
        rating: 101
    };

    expect(() => model.addGames(date, winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});
test("Adding game with invalid rating edgeCase testing #3", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "2003-23-01",
        winningTeam: "John",
        losingTeam: "This",
        rating: 100
    };

    await model.addGames(date, winningTeam, losingTeam,rating);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(date == results[0].date).toBe(true);
    expect(rating == results[0].rating).toBe(true);
    expect(losingTeam == results[0].losingTeam).toBe(true);
    expect(winningTeam == results[0].winningTeam).toBe(true);
});
test("Adding game with invalid rating edgeCase testing #4", async () => {
    const { date, winningTeam, losingTeam,rating } = {
        date: "2003-23-01",
        winningTeam: "John",
        losingTeam: "This",
        rating: 100
    };
    await model.addGames(date, winningTeam, losingTeam,rating);

    const results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(date == results[0].date).toBe(true);
    expect(rating == results[0].rating).toBe(true);
    expect(losingTeam == results[0].losingTeam).toBe(true);
    expect(winningTeam == results[0].winningTeam).toBe(true);

    
});
// ======================================
// Read
// ======================================
test("Finding single game by date and winning Team", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();

    await forceAddGame(date, winningTeam, losingTeam,rating);

    const result = await model.getSingleGameByTeamAndDate(winningTeam,date);

    expect(date == result.date).toBe(true);
    expect(winningTeam == result.winningTeam).toBe(true);
    expect(losingTeam == result.losingTeam).toBe(true);
    expect(rating == result.rating).toBe(true);
});
test("Finding single game by date and losing Team", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();

    await forceAddGame(date, winningTeam, losingTeam,rating);

    const result = await model.getSingleGameByTeamAndDate(losingTeam,date);

    expect(date == result.date).toBe(true);
    expect(winningTeam == result.winningTeam).toBe(true);
    expect(losingTeam == result.losingTeam).toBe(true);
    expect(rating == result.rating).toBe(true);
});

test("Finding single game by date and team name with no matching date in database", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const noMatchDate = "1932-15-15";

    await forceAddGame(date, winningTeam, losingTeam,rating);
    

    expect(() => model.getSingleGameByTeamAndDate(winningTeam,noMatchDate).rejects.toThrow(InvalidInputError));
});

test("Finding single game by date and team name with no matching name in database", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const noMatchingName = "ABCDEFGHIJKLMNOPQ";

    await forceAddGame(date, winningTeam, losingTeam,rating);
    

    expect(() => model.getSingleGameByTeamAndDate(noMatchingName,date).rejects.toThrow(InvalidInputError));
});

test("Finding single game by date and team with invalid date", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const badDate =  "1nval1d!!";

    expect(() => model.getSingleGameByTeamAndDate(winningTeam,badDate).rejects.toThrow(InvalidInputError));
});
test("Finding single game by date and team with invalid team name", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const badName =  "1nval1d!!";

    expect(() => model.getSingleGameByTeamAndDate(badName,date).rejects.toThrow(InvalidInputError));
});

test("Getting all games on empty database", async () => {
    const results = await model.getAllGames();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Getting all games on non-empty database", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();

    await forceAddGame(date, winningTeam, losingTeam,rating);

    const results = await model.getAllGames();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);
});

// ======================================
// Update
// ======================================
test("Updating an existing game with winning team valid data", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const updatedGame = generateGame();

    await forceAddGame(date, winningTeam, losingTeam,rating);
    await model.updateGame(date,winningTeam, updatedGame.date, updatedGame.winningTeam, updatedGame.losingTeam, updatedGame.rating);

    const results = await model.getAllGames();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedGame.date == results[0].date).toBe(true);
    expect(updatedGame.winningTeam == results[0].winningTeam).toBe(true);
    expect(updatedGame.losingTeam == results[0].losingTeam).toBe(true);
    expect(updatedGame.rating == results[0].rating).toBe(true);
});

test("Updating an existing game with losing team valid data", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const updatedGame = generateGame();

    await forceAddGame(date, winningTeam, losingTeam,rating);
    await model.updateGame(date,losingTeam, updatedGame.date, updatedGame.winningTeam, updatedGame.losingTeam, updatedGame.rating);

    const results = await model.getAllGames();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    expect(updatedGame.date == results[0].date).toBe(true);
    expect(updatedGame.winningTeam == results[0].winningTeam).toBe(true);
    expect(updatedGame.losingTeam == results[0].losingTeam).toBe(true);
    expect(updatedGame.rating == results[0].rating).toBe(true);
});

test("Updating game with invalid date", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
   

    const targetDate = "Th1s name is 1nval1d!!";
    

    expect(() => model.updateGame(targetDate, winningTeam, date,winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});

test("Updating game with invalid date", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
   

    const targetName = "Th1s name is 1nval1d!!";
    

    expect(() => model.updateGame(date, targetName, date,winningTeam, losingTeam,rating).rejects.toThrow(InvalidInputError));
});


// ======================================
// Delete
// ======================================
test("Deleting a valid existing game", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();

    await forceAddGame(date, winningTeam, losingTeam,rating);

    let results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(1);

    // Now that it has been verified that it was added, delete and check if it is gone.
    await model.deleteGame(winningTeam,date);

    results = await getAllDocuments();

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
});

test("Deleting a game with an invalid date", async () => {
    const date = "Th1s name is 1nval1d!!";
    const team = "abc"

    expect(() => model.deleteGame(team,date).rejects.toThrow(InvalidInputError));
});
test("Deleting a game with an invalid team", async () => {
    const team = "Th1s name is 1nval1d!!";
    const date = "2004-04-03"

    expect(() => model.deleteGame(team,date).rejects.toThrow(InvalidInputError));
});

test("Deleting a game with no matches in database", async () => {
    const { date, winningTeam, losingTeam,rating } = generateGame();
    const noMatchName = "ThisIsNotInTheDatabase";

    await forceAddGame(date, winningTeam, losingTeam,rating);
    expect(() => model.deleteGame(noMatchName).rejects.toThrow(InvalidInputError));
});