export function eventsMessage(prefix: string, prop: PropertyKey, args: any[]): string {
  switch (prop) {
    case 'type':
      return `Event fired: Typed \"${args[1]}\" into element`;
    case 'selectOptions':
      return `Event fired: Selected option(s) ${JSON.stringify(args[1])}`;
    case 'click':
      return `Event fired: Clicked element`;
    case 'dblClick':
      return `Event fired: Double-clicked element`;
    case 'tripleClick':
      return `Event fired: Triple-clicked element`;
    default:
      return `Event fired: ${prefix}.${String(prop)} executed`;
  }
}
