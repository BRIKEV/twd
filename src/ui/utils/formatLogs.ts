export const parseLogEntry = (log: string) => {
  try {
    const parsed = JSON.parse(log);
    if (parsed && typeof parsed === "object" && "type" in parsed) {
      return parsed;
    }
  } catch {
    // Not JSON, return as plain string
  }
  return null;
};

export const formatValue = (value: unknown): string => {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};