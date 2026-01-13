import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { expect as chaiExpect } from 'chai';
import { isChaiAssertionError, printChaiError } from '../../ui/utils/chaiErrorFormat';

describe('chaiPrint', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
    consoleLogSpy.mockRestore();
    consoleGroupSpy.mockRestore();
  });

  it('should format a chai assertion error', () => {
    try {
      chaiExpect(1).to.equal(2);
    } catch (error) {
      if (isChaiAssertionError(error)) {
        printChaiError(error);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Assertion failed with operator: strictEqual');
        expect(consoleGroupSpy).toHaveBeenCalledWith('Expected:');
        expect(consoleLogSpy).toHaveBeenCalledWith(2);
        expect(consoleGroupEndSpy).toHaveBeenCalled();
        expect(consoleGroupSpy).toHaveBeenCalledWith('Actual:');
        expect(consoleLogSpy).toHaveBeenCalledWith(1);
        expect(consoleGroupEndSpy).toHaveBeenCalled();
      }
    }
  });

  it('should format a chai assertion deep equal error', () => {
    try {
      chaiExpect({ a: 1 }).to.deep.equal({ a: 2 });
    } catch (error) {
      if (isChaiAssertionError(error)) {
        printChaiError(error);
        expect(consoleErrorSpy).toHaveBeenCalledWith('Assertion failed with operator: deepStrictEqual');
        expect(consoleGroupSpy).toHaveBeenCalledWith('Expected:');
        expect(consoleLogSpy).toHaveBeenCalledWith({ a: 2 });
        expect(consoleGroupEndSpy).toHaveBeenCalled();
        expect(consoleGroupSpy).toHaveBeenCalledWith('Actual:');
        expect(consoleLogSpy).toHaveBeenCalledWith({ a: 1 });
        expect(consoleGroupEndSpy).toHaveBeenCalled();
      }
    }
  });
});