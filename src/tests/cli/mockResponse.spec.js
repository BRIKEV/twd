import { describe, it, expect } from 'vitest';
import { mockResponse } from '../../cli/utils/mockResponse.js';

describe('mockResponse', () => {
  it('should return JSON response with default headers', async () => {
    const response = mockResponse({ data: 'test' }, 200);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');

    const body = await response.json();
    expect(body).toEqual({ data: 'test' });
  });

  it('should return null body for 204 No Content', async () => {
    const response = mockResponse({ data: 'test' }, 204);

    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });

  it('should return null body for 205 Reset Content', async () => {
    const response = mockResponse({ data: 'test' }, 205);

    expect(response.status).toBe(205);
    expect(response.body).toBeNull();
  });

  it('should return null body for 304 Not Modified', async () => {
    const response = mockResponse({ data: 'test' }, 304);

    expect(response.status).toBe(304);
    expect(response.body).toBeNull();
  });

  it('should use custom headers when provided', async () => {
    const response = mockResponse(
      { data: 'test' },
      200,
      { 'X-Custom': 'value', 'Content-Type': 'text/plain' }
    );

    expect(response.headers.get('X-Custom')).toBe('value');
    expect(response.headers.get('Content-Type')).toBe('text/plain');
  });

  it('should not include Content-Type for status codes without body when no custom headers', () => {
    const response = mockResponse({ data: 'test' }, 204);

    // Should have empty headers by default for no-body status codes
    expect(response.headers.get('Content-Type')).toBeNull();
  });

  it('should allow custom headers for status codes without body', () => {
    const response = mockResponse(
      { data: 'test' },
      204,
      { 'X-Custom-Header': 'custom-value' }
    );

    expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    expect(response.body).toBeNull();
  });

  it('should stringify response object as JSON body', async () => {
    const responseData = {
      users: [{ id: 1, name: 'John' }],
      total: 1
    };
    const response = mockResponse(responseData, 200);

    const body = await response.json();
    expect(body).toEqual(responseData);
  });

  it('should handle array response', async () => {
    const responseData = [1, 2, 3];
    const response = mockResponse(responseData, 200);

    const body = await response.json();
    expect(body).toEqual([1, 2, 3]);
  });

  it('should handle string response', async () => {
    const response = mockResponse('plain text', 200);

    const body = await response.json();
    expect(body).toBe('plain text');
  });

  it('should handle null response for success status', async () => {
    const response = mockResponse(null, 200);

    const body = await response.json();
    expect(body).toBeNull();
  });
});
