// Tests for installsw.js

import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const CLI_PATH = path.resolve(__dirname, '../../../src/cli/installsw.js');

describe('installsw.js CLI', () => {
  let exitStub, consoleErrorStub, consoleLogStub, mkdirStub, copyFileStub;

  beforeEach(async () => {
    exitStub = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    consoleErrorStub = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogStub = vi.spyOn(console, 'log').mockImplementation(() => {});
    mkdirStub = vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {});
    copyFileStub = vi.spyOn(fs, 'copyFileSync').mockImplementation(() => {});
    await vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exits with error if command is not init', async () => {
    process.argv = ['node', 'installsw.js', 'badcmd'];
    await expect(import(CLI_PATH)).rejects.toThrow();
    expect(consoleErrorStub).toHaveBeenCalled();
    expect(exitStub).toHaveBeenCalled();
  });

  it('exits with error if no targetDir', async () => {
    process.argv = ['node', 'installsw.js', 'init'];
    await expect(import(CLI_PATH)).rejects.toThrow();
    expect(consoleErrorStub).toHaveBeenCalled();
    expect(exitStub).toHaveBeenCalled();
  });

  it('copies file and logs success', async () => {
    process.argv = ['node', 'installsw.js', 'init', 'public'];
    await import(CLI_PATH);
    expect(mkdirStub).toHaveBeenCalled();
    expect(copyFileStub).toHaveBeenCalled();
    expect(consoleLogStub.mock.calls.some(call => call[0].includes('mock-sw.js copied'))).toBeTruthy();
  });

  it('logs registration tip if --save', async () => {
    process.argv = ['node', 'installsw.js', 'init', 'public', '--save'];
    await import(CLI_PATH);
    expect(consoleLogStub.mock.calls.some(call => call[0].includes('Remember to register'))).toBeTruthy();
  });
});
