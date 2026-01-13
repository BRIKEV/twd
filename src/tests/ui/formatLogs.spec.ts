import { describe, it, expect } from 'vitest';
import { formatValue, getDisplayText, parseLogEntry, assertStyles, LogType } from '../../ui/utils/formatLogs';

describe('formatLogs', () => {
  describe('formatValue', () => {
    it('should handle null, undefined, and string values', () => {
      expect(formatValue(null)).toBe('null');
      expect(formatValue(undefined)).toBe('undefined');
      expect(formatValue('hello')).toBe('hello');
    });

    it('should stringify objects and arrays', () => {
      expect(formatValue({ a: 1 })).toContain('"a": 1');
      expect(formatValue([1, 2])).toContain('1');
    });

    it('should fall back to String() for non-serializable values', () => {
      const circular: any = { a: 1 };
      circular.self = circular;
      const result = formatValue(circular);
      expect(typeof result).toBe('string');
    });
  });

  describe('getDisplayText', () => {
    it('should return original log when parsedLog is null', () => {
      expect(getDisplayText('plain log', null)).toBe('plain log');
    });

    it('should return message for ChaiMessageLog and ErrorLog', () => {
      const messageLog: any = { type: LogType.CHAI_MESSAGE, message: 'test message' };
      const errorLog: any = { type: LogType.ERROR, message: 'error message' };
      
      expect(getDisplayText('original', messageLog)).toBe('test message');
      expect(getDisplayText('original', errorLog)).toBe('error message');
    });

    it('should return original log for ChaiDiffLog', () => {
      const diffLog: any = { type: LogType.CHAI_DIFF, expected: 2, actual: 1 };
      expect(getDisplayText('original log', diffLog)).toBe('original log');
    });
  });

  describe('parseLogEntry', () => {
    it('should parse valid log entries', () => {
      const diffLog = JSON.stringify({ type: LogType.CHAI_DIFF, expected: 2, actual: 1 });
      const messageLog = JSON.stringify({ type: LogType.CHAI_MESSAGE, message: 'test' });
      
      expect(parseLogEntry(diffLog)?.type).toBe(LogType.CHAI_DIFF);
      expect(parseLogEntry(messageLog)?.type).toBe(LogType.CHAI_MESSAGE);
    });

    it('should return null for invalid JSON or missing type', () => {
      expect(parseLogEntry('invalid json')).toBeNull();
      expect(parseLogEntry('plain text')).toBeNull();
      expect(parseLogEntry(JSON.stringify({ data: 'test' }))).toBeNull();
    });
  });

  describe('assertStyles', () => {
    it('should return success styles for "Assertion passed" and "Event fired"', () => {
      expect(assertStyles('Assertion passed: test')).toEqual({
        color: 'var(--twd-success)',
        fontWeight: 'var(--twd-font-weight-bold)'
      });
      expect(assertStyles('Event fired: click')).toEqual({
        color: 'var(--twd-success)',
        fontWeight: 'var(--twd-font-weight-bold)'
      });
    });

    it('should return error styles for "Test failed"', () => {
      expect(assertStyles('Test failed: error')).toEqual({
        color: 'var(--twd-error)',
        fontWeight: 'var(--twd-font-weight-bold)'
      });
    });

    it('should return empty styles for other text', () => {
      expect(assertStyles('other text')).toEqual({});
    });
  });
});
