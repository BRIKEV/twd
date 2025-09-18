// Pure utility to find a matching rule
// Usage: findRule(method, url, rules)

export function findRule(method, url, rules) {
  return rules.find(
    (r) =>
      r.method === method &&
      (typeof r.url === 'string' ? r.url === url : new RegExp(r.url).test(url))
  );
}
