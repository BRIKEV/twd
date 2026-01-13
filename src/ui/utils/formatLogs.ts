export enum LogType {
  CHAI_DIFF = "chai-diff",
  CHAI_MESSAGE = "chai-message",
  ERROR = "error",
}

interface ChaiDiffLog {
  type: LogType.CHAI_DIFF;
  expected: unknown;
  actual: unknown;
}

interface ChaiMessageLog {
  type: LogType.CHAI_MESSAGE;
  message: string;
}

interface ErrorLog {
  type: LogType.ERROR;
  message: string;
}

export type ParsedLog = ChaiDiffLog | ChaiMessageLog | ErrorLog;

export const parseLogEntry = (log: string): ParsedLog | null => {
  try {
    const parsed = JSON.parse(log);
    if (parsed && typeof parsed === "object" && "type" in parsed) {
      return parsed as ParsedLog;
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

export const assertStyles = (text: string) => {
  if (text.startsWith("Assertion passed") || text.startsWith("Event fired")) {
    return { color: "var(--twd-success)", fontWeight: "var(--twd-font-weight-bold)" };
  } else if (text.startsWith("Test failed")) {
    return { color: "var(--twd-error)", fontWeight: "var(--twd-font-weight-bold)" };
  }
  return {};
};

const isMessageLog = (log: ParsedLog): log is ChaiMessageLog | ErrorLog => {
  return log.type === LogType.CHAI_MESSAGE || log.type === LogType.ERROR;
};

export const getDisplayText = (log: string, parsedLog: ParsedLog | null): string => {
  if (!parsedLog) {
    return log;
  }
  
  if (isMessageLog(parsedLog)) {
    return parsedLog.message;
  }
  
  return log;
};
