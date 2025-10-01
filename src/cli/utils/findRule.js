// Pure utility to find a matching rule
// Usage: findRule(method, url, rules)


/**
 * @typedef {Object} Rule
 * @property {string} method - HTTP method (e.g., 'GET', 'POST')
 * @property {string} url - URL string or regex pattern
 * @property {boolean} [urlRegex] - Whether the url is a regex pattern
 * @property {string} alias - Alias for the rule
 */

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
      if (r.urlRegex) {
        const regex = new RegExp(r.url);
        return isMethodMatch && regex.test(url);
      }
      const isUrlMatch = r.url === url || url.includes(r.url);
      return isMethodMatch && isUrlMatch;
  });
}
