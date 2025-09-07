import { describe, expect, it } from 'vitest';
import { mockRequest, waitFor } from '../../commands/mockResponses';

describe('mockRequest', () => {
  it('should mock fetch requests and return the mocked response', async () => {
    const mockUrl = 'https://api.example.com/data';
    const alias = 'getData';
    const mockResponse = { message: 'Hello, World!' };

    // Set up the mock response
    mockRequest(alias, {
      url: mockUrl,
      status: 200,
      method: 'GET',
      response: mockResponse,
      headers: { 'Content-Type': 'application/json' },
    });
    // Make the fetch request
    const response = await fetch(mockUrl);
    const data = await response.json();

    // Verify the response
    expect(response.status).toBe(200);
    expect(data).toEqual(mockResponse);

    // Wait for the mock to be registered as executed
    const executedRule = await waitFor(alias);
    expect(executedRule).toBeDefined();
    expect(executedRule?.request).toBeUndefined(); // No body for GET request
  });
});