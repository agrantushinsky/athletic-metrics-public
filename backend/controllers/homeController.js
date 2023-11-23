const express = require('express');
const router = express.Router();
const routeRoot = '/';


router.get('/',sayHelloWorld)

/**
 * Sends back a hello message with status 200 on /.
 * 
 * @param {*} request HTTP request on GET /
 * @param {*} response HTTP response object
 */
function sayHelloWorld(request, response) {
    response.status= 200;
    response.send("Hello World")

}

module.exports = {
    router,
    routeRoot
}
