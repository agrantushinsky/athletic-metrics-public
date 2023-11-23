const express = require('express');
const router = express.Router();
const routeRoot = '*';

router.all(routeRoot,sayError)

/**
 * Sends back a message with a 404 status on the user attempting to access an undefined endpoint.
 * 
 * @param {*} request any HTTP request on any endpoints that were not found.
 * @param {*} response HTTP response object
 */
function sayError(request, response) {
    response.status= 404;
    response.send("Invalid url entered please try again")

}


module.exports = {
     router,
     routeRoot
}
