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
 * @property {number} [delay] - Delay in ms before returning the response.
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
 * Known file extensions that should be detected as files.
 * This prevents versioned API paths like /api.v2 from being treated as files.
 */
const FILE_EXTENSIONS = new Set([
  // JavaScript/TypeScript
  'js', 'mjs', 'cjs', 'ts', 'tsx', 'jsx', 'mts', 'cts',
  // Styles
  'css', 'scss', 'sass', 'less', 'styl',
  // Markup
  'html', 'htm', 'xml', 'xhtml', 'vue', 'svelte',
  // Data
  'json', 'yaml', 'yml', 'toml', 'csv',
  // Documents
  'txt', 'md', 'mdx', 'pdf', 'doc', 'docx',
  // Images
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif',
  // Fonts
  'woff', 'woff2', 'ttf', 'eot', 'otf',
  // Media
  'mp3', 'mp4', 'webm', 'ogg', 'wav',
  // Archives
  'zip', 'tar', 'gz', 'rar',
  // Maps
  'map',
]);

/**
 * Check if the url is a file with a known extension
 * (handles query params, e.g. /api.twd.test.ts?t=12345)
 * @param {string} url
 * @returns {boolean}
 */
const isFile = (url) => {
  // Remove query string before checking for file extension
  const urlWithoutQuery = url.split('?')[0];
  const match = urlWithoutQuery.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return false;
  return FILE_EXTENSIONS.has(match[1].toLowerCase());
};

/**
 * Check if the match ends at a URL boundary.
 * Valid boundaries: end of string, '/', '?', '#', '&'
 * This prevents '/users' from matching '/users-settings'.
 * Boundary checking only applies to the path portion of the URL.
 * If the match extends into the query string, it is always valid
 * (e.g. rule "shows?q=" matches "shows?q=friends").
 * @param {string} url
 * @param {string} ruleUrl
 * @returns {boolean}
 */
const isBoundaryMatch = (url, ruleUrl) => {
  const matchIndex = url.indexOf(ruleUrl);
  if (matchIndex === -1) return false;
  const matchEnd = matchIndex + ruleUrl.length;
  const charAfter = url[matchEnd];
  if (charAfter === undefined) return true;
  // If the match extends past the query string, it's valid
  const queryStart = url.indexOf('?');
  if (queryStart !== -1 && matchEnd > queryStart) return true;
  return '?#&'.includes(charAfter);
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
      const isUrlMatch = r.url === url || isBoundaryMatch(url, r.url);
      return isMethodMatch && isUrlMatch && !isFile(url);
  });
}
