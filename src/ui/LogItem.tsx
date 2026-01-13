import { parseLogEntry, formatValue, assertStyles, getDisplayText, LogType } from "./utils/formatLogs";

interface LogItemProps {
  log: string;
  index: number;
}

export const LogItem = ({ log, index }: LogItemProps) => {
  const parsedLog = parseLogEntry(log);

  // If it's a structured Chai diff error, render it nicely
  if (parsedLog?.type === LogType.CHAI_DIFF) {
    return (
      <li
        key={index}
        style={{
          fontSize: "var(--twd-font-size-sm)",
          padding: "var(--twd-spacing-sm)",
          borderBottom: "1px solid var(--twd-border-light)",
          color: "var(--twd-text)",
        }}
      >
        <div style={{ 
          color: "var(--twd-error)", 
          fontWeight: "var(--twd-font-weight-bold)",
          marginBottom: "var(--twd-spacing-xs)",
        }}>
          ❌ Assertion failed
        </div>
        <div style={{ 
          marginTop: "var(--twd-spacing-xs)",
          paddingLeft: "var(--twd-spacing-sm)",
          borderLeft: "2px solid var(--twd-success)",
        }}>
          <div style={{ 
            color: "var(--twd-success)", 
            fontWeight: "var(--twd-font-weight-medium)",
            marginBottom: "var(--twd-spacing-xs)",
          }}>
            Expected:
          </div>
          <pre style={{
            margin: 0,
            padding: "var(--twd-spacing-xs)",
            background: "var(--twd-background)",
            borderRadius: "var(--twd-border-radius)",
            fontSize: "var(--twd-font-size-xs)",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {formatValue(parsedLog.expected)}
          </pre>
        </div>
        <div style={{ 
          marginTop: "var(--twd-spacing-xs)",
          paddingLeft: "var(--twd-spacing-sm)",
          borderLeft: "2px solid var(--twd-error)",
        }}>
          <div style={{ 
            color: "var(--twd-error)", 
            fontWeight: "var(--twd-font-weight-medium)",
            marginBottom: "var(--twd-spacing-xs)",
          }}>
            Actual:
          </div>
          <pre style={{
            margin: 0,
            padding: "var(--twd-spacing-xs)",
            background: "var(--twd-background)",
            borderRadius: "var(--twd-border-radius)",
            fontSize: "var(--twd-font-size-xs)",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {formatValue(parsedLog.actual)}
          </pre>
        </div>
      </li>
    );
  }

  // For other structured errors or plain text
  const displayText = getDisplayText(log, parsedLog);

  return (
    <li
      key={index}
      style={{
        fontSize: "var(--twd-font-size-sm)",
        padding: "var(--twd-spacing-xs) var(--twd-spacing-sm)",
        borderBottom: "1px solid var(--twd-border-light)",
        color: "var(--twd-text)",
        ...assertStyles(displayText),
      }}
    >
      {displayText}
    </li>
  );
};
