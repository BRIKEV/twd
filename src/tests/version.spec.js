import { describe, it, expect } from 'vitest';
import { TWD_VERSION } from '../constants/version_cli';
import pkg from '../../package.json';

describe('TWD_VERSION', () => {
  it('should be the correct version', () => {
    expect(TWD_VERSION).toBe(pkg.version);
  });
});
