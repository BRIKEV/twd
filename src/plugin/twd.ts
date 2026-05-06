import type { Plugin } from 'vite';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TwdPluginOptions {}

export function twd(_options: TwdPluginOptions = {}): Plugin {
  return {
    name: 'twd',
    apply: 'serve',
  };
}
