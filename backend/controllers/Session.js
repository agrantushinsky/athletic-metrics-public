const uuid = require("uuid");

// Each session contains the username of the user and the time at which it expires
//  This object can be extended to store additional protected session information
class Session {
  constructor(username, expiresAt, administrator) {
    this.username = username;
    this.expiresAt = expiresAt;
    this.administrator = administrator;
  }
  // We'll use this method later to determine if the session has expired
  isExpired() {
    this.expiresAt < new Date();
  }
}

const sessions = [];

/**
 * Creates a session with the information provided.
 * 
 * @param {*} username of session
 * @param {*} numMinutes for the session expiry
 * @param {*} administrator boolean for administrator status
 * @returns sessionId
 */
function createSession(username, numMinutes, administrator) {
  // Generate a random UUID as the sessionId
  const sessionId = uuid.v4();
  // Set the expiry time as numMinutes (in milliseconds) after the current time
  const expiresAt = new Date(Date.now() + numMinutes * 60000);

  // Create a session object containing information about the user and expiry time
  const thisSession = new Session(username, expiresAt, administrator);

  // Add the session information to the sessions map, using sessionId as the key
  sessions[sessionId] = thisSession;
  return sessionId;
}

/**
 * Gets a session by sessionId.
 * 
 * @param {*} sessionId to search by.
 * @returns session object
 */
function getSession(sessionId) {
  return sessions[sessionId];
}

/**
 * Destroys a session by sessionId
 * 
 * @param {*} sessionId to target for deletion.
 */
function deleteSession(sessionId) {
  delete sessions[sessionId];
}

module.exports = { Session, createSession, getSession, deleteSession };
