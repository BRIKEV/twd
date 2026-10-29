// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { build } from 'vite';
import { removeMockServiceWorker } from '../../vite-plugin';

type WriteBundle = (this: unknown, outputOptions: { dir?: string; file?: string }) => void;

const runWriteBundle = (
  plugin: ReturnType<typeof removeMockServiceWorker>,
  dir: string,
  consumer: 'client' | 'server' = 'client',
) => {
  const hook = plugin.writeBundle as unknown as WriteBundle;
  hook.call({ environment: { config: { consumer } } }, { dir });
};

describe('removeMockServiceWorker', () => {
  let tmp: string;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    tmp = mkdtempSync(join(tmpdir(), 'twd-remove-sw-'));
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    rmSync(tmp, { recursive: true, force: true });
    vi.restoreAllMocks();
  });

  it('should return a build-only Vite plugin', () => {
    const plugin = removeMockServiceWorker();

    expect(plugin.name).toBe('remove-mock-sw');
    expect(plugin.apply).toBe('build');
    expect(typeof plugin.writeBundle).toBe('function');
  });

  it('should remove mock-sw.js from the output dir of the build, not from dist/', () => {
    const outDir = join(tmp, 'build', 'client');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'mock-sw.js'), '// worker');

    runWriteBundle(removeMockServiceWorker(), outDir);

    expect(existsSync(join(outDir, 'mock-sw.js'))).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('🧹 twd: removed mock-sw.js from'),
    );
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it('should log the absolute path when the output dir is outside the project', () => {
    const outDir = join(tmp, 'out');
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'mock-sw.js'), '// worker');

    runWriteBundle(removeMockServiceWorker(), outDir);

    expect(consoleLogSpy).toHaveBeenCalledWith(`🧹 twd: removed mock-sw.js from ${outDir}`);
  });

  it('should remove a worker with a custom file name', () => {
    const outDir = join(tmp, 'dist');
    mkdirSync(join(outDir, 'workers'), { recursive: true });
    writeFileSync(join(outDir, 'workers', 'custom-sw.js'), '// worker');

    runWriteBundle(removeMockServiceWorker({ fileName: 'workers/custom-sw.js' }), outDir);

    expect(existsSync(join(outDir, 'workers', 'custom-sw.js'))).toBe(false);
  });

  it('should warn instead of reporting success when the client build has no worker', () => {
    const outDir = join(tmp, 'dist');
    mkdirSync(outDir, { recursive: true });

    runWriteBundle(removeMockServiceWorker(), outDir);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('mock-sw.js was not found'),
    );
    expect(consoleLogSpy).not.toHaveBeenCalledWith('🧹 No mock-sw.js found in build');
  });

  it('should stay silent when a server build has no worker', () => {
    const outDir = join(tmp, 'build', 'server');
    mkdirSync(outDir, { recursive: true });

    runWriteBundle(removeMockServiceWorker(), outDir, 'server');

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it('should remove the worker in a real Vite build with a custom outDir', async () => {
    const root = join(tmp, 'app');
    mkdirSync(join(root, 'public'), { recursive: true });
    writeFileSync(join(root, 'index.html'), '<!doctype html><html><body></body></html>');
    writeFileSync(join(root, 'public', 'mock-sw.js'), '// worker');
    writeFileSync(join(root, 'public', 'robots.txt'), 'User-agent: *');

    await build({
      root,
      configFile: false,
      logLevel: 'silent',
      build: { outDir: 'build/client' },
      plugins: [removeMockServiceWorker()],
    });

    const outDir = join(root, 'build', 'client');
    expect(existsSync(join(outDir, 'robots.txt'))).toBe(true);
    expect(existsSync(join(outDir, 'mock-sw.js'))).toBe(false);
  });
});
