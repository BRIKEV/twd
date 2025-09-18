// Utility to notify all clients with a message
// Usage: notifyClients(clients, rule, body)

export function notifyClients(clients, rule, body) {
  clients.forEach((client) =>
    client.postMessage({
      type: "EXECUTED",
      alias: rule.alias,
      request: body,
    })
  );
}
