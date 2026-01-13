interface ChaiAssertionError extends Error {
  actual?: unknown;
  expected?: unknown;
  operator?: string;
  showDiff?: boolean;
}

const isChaiAssertionError = (error: unknown): error is ChaiAssertionError => {
  return (
    error instanceof Error &&
    "actual" in error &&
    "expected" in error
  );
};

const formatChaiError = (error: ChaiAssertionError) => {
  if (error.showDiff && error.actual !== undefined && error.expected !== undefined) {
    return {
      type: "diff",
      actual: error.actual,
      expected: error.expected,
      operator: error.operator,
    };
  }

  return {
    type: "message",
    message: error.message,
  };
};

export { isChaiAssertionError, formatChaiError };