export function domMessage(prefix: string, prop: PropertyKey, args: any[]): string {
  const fn = String(prop);

  // Query methods (getBy, queryBy, findBy, etc.)
  if (/^(get|query|find)(All)?By/.test(fn)) {
    const selector = args[0];
    return `query: ${fn}("${selector}")`;
  }

  // "within" is special — it returns another querying object
  if (fn === 'within') {
    const container = args[0];
    const tag = container?.tagName || 'unknown';
    return `helper: within(<${tag.toLowerCase()}>) called`;
  }

  // prettyDOM / logDOM utilities
  if (fn === 'prettyDOM' || fn === 'logDOM') {
    return `debug: ${fn} called`;
  }

  // act, waitFor, waitForElementToBeRemoved
  if (['act', 'waitFor', 'waitForElementToBeRemoved'].includes(fn)) {
    return `async utility: ${fn} executed`;
  }

  // Default fallback
  return `method: ${prefix}.${fn} executed`;
}
