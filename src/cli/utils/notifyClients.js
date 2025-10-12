/**
 * @typedef {Object} Rule
 * @property {string} method - HTTP method to match (e.g., 'GET', 'POST').
 * @property {string|RegExp} url - URL or RegExp to match against the request URL.
 * @property {unknown} response - Mock response body.
 * @property {string} alias - Unique identifier for the rule.
 * @property {boolean} [executed] - Indicates if the rule has been executed.
 * @property {unknown} [request] - Captured request body or data.
 * @property {number} [status] - HTTP status code for the response.
 * @property {Record<string, string>} [responseHeaders] - Headers to include in the response.
 * @property {boolean} [urlRegex] - Whether the URL is a regex pattern.
 */

/**
 * Notifies all connected clients about the execution of a rule.
 *
 * Sends a message to each client in the provided list, containing information
 * about the executed rule and the associated request body.
 *
 * @param {Array<{ postMessage: Function }>} clients - An array of client objects, each with a `postMessage` method.
 * @param {Rule} rule - The rule object that was executed, containing at least an `alias` property.
 * @param {unknown} body - The request body or payload to send to the clients.
 */
export function notifyClients(clients, rule, body) {
  clients.forEach((client) =>
    client.postMessage({
      type: "EXECUTED",
      alias: rule.alias,
      request: body,
    })
  );
}
