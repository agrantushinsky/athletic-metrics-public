const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');

const cookieParser = require('cookie-parser');

// Make sure errorController is last!
const controllers = ['homeController', 'teamsController', 'playerController','gamesController', 'usersController', 'sessionController', 'errorController' ];

const corsOptions = {
    origin: process.env.FRONT_END,
    credentials: true,
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "X-Requested-With, Accept, Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONT_END);
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, PUT, DELETE, OPTIONS, PATCH");
    next();
});
app.use(cookieParser());

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Make pino log http requests
const logger = require('./logger');
const pinohttp = require('pino-http');
const httpLogger = pinohttp({
    logger: logger
});
app.use(httpLogger);

// Register routes from all controllers 
controllers.forEach((controllerName) => {
    try {
        const controllerRoutes = require('./controllers/' + controllerName);
        app.use(controllerRoutes.routeRoot, controllerRoutes.router);
    } catch (error) {      
        logger.error(error);
        throw error;
    }    
});

module.exports = app;