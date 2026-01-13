export const statusStyles = (node: Test) => {
  switch (node.status) {
    case "pass":
      return {
        item: {
          background: "var(--twd-success-bg)",
        },
        container: {
          borderLeft: "3px solid var(--twd-success)",
        },
      };
    case "fail":
      return {
        item: {
          background: "var(--twd-error-bg)",
        },
        container: {
          borderLeft: "3px solid var(--twd-error)",
        },
      };
    case "skip":
      return {
        item: {
          background: "var(--twd-skip-bg)",
        },
      };
    case "running":
      return {
        item: {
          background: "var(--twd-warning-bg)",
        },
      };
    default:
      return {
        item: {
          background: "transparent",
        },
      };
  }
};

export const assertStyles = (text: string) => {
  if (text.startsWith("Assertion passed") || text.startsWith("Event fired")) {
    return { color: "var(--twd-success)", fontWeight: "var(--twd-font-weight-bold)" };
  } else if (text.startsWith("Test failed")) {
    return { color: "var(--twd-error)", fontWeight: "var(--twd-font-weight-bold)" };
  }
  return {};
};
