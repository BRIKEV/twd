import { describe, it, expect, vi } from 'vitest';
import { mockResponse } from '../../cli/utils/mockResponse.js';

describe('mockResponse', () => {
  const responseBody = { message: 'ok' };
  it('should create a Response with body for status 200', () => {
    const response = mockResponse(responseBody, 200, { 'Content-Type': 'application/json' });
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    return response.json().then((data) => {
      expect(data).toEqual(responseBody);
    });
  });

  it('should create a Response without body for status 204', () => {
    const response = mockResponse(responseBody, 204, { 'Content-Type': 'application/json' });
    expect(response.status).toBe(204);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    return response.text().then((data) => {
      expect(data).toBe('');
    });
  });

  it('should use default headers if none provided', () => {
    const response = mockResponse(responseBody, 200);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });
});