require("dotenv").config();
const app = require('./app.js');
const port = 1339;

const model1 = require('./models/teamsModel.js');
const model2 = require('./models/playerModel.js');
const model3 = require('./models/gamesModel');
const model4 = require('./models/usersModel');

const url = process.env.URL_PRE + process.env.MONGODB_PWD + process.env.URL_POST;

const db_name = "athletic_metrics_db";

let models = [ model1.initialize(db_name, url, false), model2.initialize(db_name, url, false), 
              model3.initialize(db_name, url, false), model4.initialize(db_name, url, false) ];
Promise.all(models)
.then(
    app.listen(port) // Run the server
);