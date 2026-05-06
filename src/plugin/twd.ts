import type { Plugin } from 'vite';
import type { TWDTheme } from '../ui/utils/theme';

export interface TwdPluginOptions {
  testFilePattern?: string;
  open?: boolean;
  position?: 'left' | 'right';
  serviceWorker?: boolean;
  serviceWorkerUrl?: string;
  theme?: Partial<TWDTheme>;
  search?: boolean;
  rootSelector?: string;
}

const VIRTUAL_ID = 'virtual:twd/init';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;
const DEFAULT_PATTERN = '/**/*.twd.test.ts';

const DEFAULT_INIT_OPTIONS = {
  open: true,
  position: 'left',
  serviceWorker: true,
  serviceWorkerUrl: '/mock-sw.js',
} as const;

export function twd(options: TwdPluginOptions = {}): Plugin {
  const { testFilePattern = DEFAULT_PATTERN, ...userInitOptions } = options;
  const initOptions = { ...DEFAULT_INIT_OPTIONS, ...userInitOptions };

  return {
    name: 'twd',
    apply: 'serve',
    resolveId(id) {
      if (id === VIRTUAL_ID) {
        return RESOLVED_VIRTUAL_ID;
      }
      return null;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return null;
      const patternLiteral = JSON.stringify(testFilePattern);
      const optionsLiteral = JSON.stringify(initOptions);
      return [
        `import { initTWD } from 'twd-js/bundled';`,
        `const tests = import.meta.glob(${patternLiteral});`,
        `initTWD(tests, ${optionsLiteral});`,
      ].join('\n');
    },
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          attrs: { type: 'module', src: `/@id/${VIRTUAL_ID}` },
          injectTo: 'head' as const,
        },
      ];
    },
  };
}
