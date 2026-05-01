import { describe, it, expect } from 'vitest';
import { expect as chaiExpect } from 'chai';
import { formatChaiError, isChaiAssertionError } from '../../ui/utils/chaiErrorFormat';

describe('chaiErrorFormat', () => {
  it('should format a chai assertion error', () => {
    try {
      chaiExpect(1).to.equal(2);
    } catch (error) {
      if (isChaiAssertionError(error)) {
        const formattedError = formatChaiError(error);
        expect(formattedError).toEqual({
          actual: 1,
          expected: 2,
          operator: 'strictEqual',
          type: 'diff',
        });
      }
    }
  });

  it('should format a chai assertion deep equal error', () => {
    try {
      chaiExpect({ a: 1 }).to.deep.equal({ a: 2 });
    } catch (error) {
      if (isChaiAssertionError(error)) {
        const formattedError = formatChaiError(error);
        expect(formattedError).toEqual({
          actual: { a: 1 },
          expected: { a: 2 },
          operator: 'deepStrictEqual',
          type: 'diff',
        });
      }
    }
  });

  it('should format a chai assertion have length error', () => {
    try {
      chaiExpect([1, 2, 3]).to.have.length(4);
    } catch (error) {
      if (isChaiAssertionError(error)) {
        const formattedError = formatChaiError(error);
        expect(formattedError).toEqual({
          actual: 3,
          expected: 4,
          operator: undefined,
          type: 'diff',
        });
      }
    }
  });

  it('should format a chai assertion not have existence error', () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- chai's .exist is a property getter that throws; it has no return value
      chaiExpect(undefined).to.exist;
    } catch (error) {
      if (isChaiAssertionError(error)) {
        const formattedError = formatChaiError(error);
        expect(formattedError).toEqual({
          message: 'expected undefined to exist',
          type: 'message',
        });
      }
    }
  });
});
