/**
 * Talks to the twdSnapshot Vite plugin. The browser cannot write files; the dev
 * server already has the filesystem in front of it.
 */
const ENDPOINT = '/__twd/snapshot';

const PLUGIN_MISSING = [
  'matchLayout needs the twdSnapshot() Vite plugin to read and write snapshots.',
  '',
  "  import { twdSnapshot } from 'twd-js/vite-plugin';",
  '',
  '  export default defineConfig({',
  '    plugins: [twdSnapshot()],',
  '  });',
].join('\n');

export interface SnapshotReference {
  exists: boolean;
  snap: string | null;
  /** Where the plugin keeps snapshots, so messages name the real path. */
  dir: string;
}

async function asJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  // Vite serves index.html for unknown paths, so a missing plugin comes back as
  // a 200 full of HTML rather than a 404. Anything that is not JSON means the
  // plugin is not there to answer.
  if (!contentType.includes('application/json')) {
    throw new Error(PLUGIN_MISSING);
  }

  let body: { error?: string };
  try {
    body = (await response.json()) as { error?: string };
  } catch {
    // A JSON content type we cannot actually parse means something answered
    // that is not the plugin, or the plugin failed mid-response. Report the
    // status rather than letting a raw SyntaxError reach the user.
    throw new Error(`The twdSnapshot plugin returned an unreadable response (${response.status}).`);
  }

  // JSON with a bad status means the plugin IS there and refused. Surface its
  // reason instead of blaming a missing plugin.
  if (!response.ok) {
    throw new Error(
      `The twdSnapshot plugin refused the request (${response.status}): ${body.error ?? 'unknown error'}`,
    );
  }

  return body;
}

export async function readSnapshot(name: string): Promise<SnapshotReference> {
  const response = await fetch(`${ENDPOINT}?name=${encodeURIComponent(name)}`);
  return (await asJson(response)) as SnapshotReference;
}

export async function writeSnapshot(
  name: string,
  body: { snap?: string; png?: string; suffix?: string },
): Promise<{ written: string[] }> {
  const response = await fetch(`${ENDPOINT}?name=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return (await asJson(response)) as { written: string[] };
}
