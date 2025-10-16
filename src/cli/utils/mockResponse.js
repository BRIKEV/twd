
/**
 * Mocks a Response object based on the given status and headers.
 * If the status code does not allow a body, the body will be null.
 * Otherwise, it will return the rule's response as a JSON string.
 * @param {unknown} response
 * @param {number} status
 * @param {Record<string, string>} [headers]
 * @returns {Response}
 */
export const mockResponse = (response, status, headers) => {
  // Status codes that cannot have a body
  const statusCodesWithoutBody = [204, 205, 304];
  const shouldIncludeBody = !statusCodesWithoutBody.includes(status);

  const body = shouldIncludeBody ? JSON.stringify(response) : null;

  return new Response(
    body,
    {
      status,
      headers: shouldIncludeBody
        ? (headers || { "Content-Type": "application/json" })
        : (headers || {}),
    }
  );
};