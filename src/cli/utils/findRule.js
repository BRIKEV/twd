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

const validRegex = (pattern) => {
  try {
    new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if the url is a file with extension
 * (handles query params, e.g. /api.twd.test.ts?t=12345)
 * @param {string} url
 * @returns {boolean}
 */
const isFile = (url) => {
  // Remove query string before checking for file extension
  const urlWithoutQuery = url.split('?')[0];
  const regex = /\.([a-zA-Z0-9]+)$/;
  return regex.test(urlWithoutQuery);
};

/**
 * Find a matching rule based on method and url
 * @param {string} method
 * @param {string} url
 * @param {Array<Rule>} rules
 * @returns {Rule|undefined}
 */
export function findRule(method, url, rules) {
  return rules.find(
    (r) => {
      const isMethodMatch = r.method.toLowerCase() === method.toLowerCase();
      if (r.urlRegex && validRegex(r.url)) {
        const regex = new RegExp(r.url);
        return isMethodMatch && regex.test(url);
      }
      const ruleIsFile = isFile(r.url);
      if (ruleIsFile) {
        return isMethodMatch && url.includes(r.url);
      }
      const isUrlMatch = r.url === url || url.includes(r.url);
      return isMethodMatch && isUrlMatch && !isFile(url);
  });
}
