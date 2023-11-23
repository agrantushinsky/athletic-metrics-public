const validator = require('validator');
const countryList = require('country-list');
const { InvalidInputError } = require('./InvalidInputError');

/**
 * Checks whether name is valid: must be non-empty and alpha characters only, 
 * with the exception of '-' and ' ' characters being allowed.
 * 
 * @param {string} name of sport
 * @returns {boolean} true if valid
 * @throws {InvalidInputError} Thrown when name is invalid
 */
function isNameValid(name) {
    // Don't allow empty names
    if(name.length == 0) {
        throw new InvalidInputError("Name was empty.");
    }

    // Don't allow non-alpha characters, and ignore ' ' and '-'
    if(!validator.isAlpha(name, undefined, {ignore: "- "})) {
        throw new InvalidInputError("Name must be alpha characters only.");
    }

    return true;
}

/**
 * Checks if the booleans sent as an argument is type "boolean"
 * 
 * @param {boolean} boolean to be tested
 * @returns {boolean} true if valid
 * @throws {InvalidInputError} Thrown when the boolean is not the correct type.
 */
function isBoolean(boolean) {
    if(!(typeof boolean === "boolean"))
        throw new InvalidInputError("The isTeamBased argument was not of type \"boolean\"");

    return true;
}

/**
 * Checks if the countryName is a valid country name or "Unknown". Case-sensitivity will be checked.
 * 
 * @param {String} countryName to be tested.
 * @returns {boolean} true if valid
 * @throws {InvalidInputError} Thrown when the countryName is not a valid country.
 */
function isValidCountry(countryName) {
    if(!countryList.getNames().includes(countryName))
        throw new InvalidInputError("The country name is not a valid country.");

    return true;
}

function IsValidAge(age)
{
    if(age<0 || age>100 || isNaN(age)){throw InvalidInputError("Invalid age entered. Age must be between 0-100 and a number")}

    return true;
}

function IsValidPoints(points)
{
    if(points<0 || points>100 || isNaN(points)){throw InvalidInputError("Invalid points entered. Points must be between 0-100 and a number")}

    return true;
}

function isValidDate(date) 
{
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
  if(!date.match(regEx)) throw new InvalidInputError("date is not valid");  // Invalid format
  return true;
}

function isValidRating(rating) 
{
   
  if(!isNaN(rating) && rating>=0 && rating <= 100) return true;  // Invalid format
  throw new InvalidInputError("rating is not a valid");
}

/**
 * Validates a password. Password must be 8 character long.
 * 
 * @param {*} password to validate
 * @throws {InvalidInputError} thrown when password is invalid
 * @returns true when successful
 */
function isValidPassword(password) {
    if(password.length < 8) {
        throw new InvalidInputError("The password must contain at least 8 characters.");
    }

    return true;
}

module.exports = { 
    isNameValid, isBoolean, isValidCountry,IsValidPoints,IsValidAge,isValidDate, isValidRating, isValidPassword
};