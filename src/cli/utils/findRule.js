// Pure utility to find a matching rule
// Usage: findRule(method, url, rules)

export function findRule(method, url, rules) {
  return rules.find(
    (r) => {
      const isMethodMatch = r.method.toLowerCase() === method.toLowerCase();
      const isUrlMatch = typeof url === 'string'
        ? r.url === url || r.url.includes(url) : new RegExp(url).test(r.url);
      return isMethodMatch && isUrlMatch;
  });
}
