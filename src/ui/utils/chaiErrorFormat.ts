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
  // Check if we have actual and expected values (even if showDiff is not set)
  if (error.actual !== undefined && error.expected !== undefined) {
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

const printChaiError = (error: ChaiAssertionError) => {
  const formattedError = formatChaiError(error);
  if (formattedError.type === "diff") {
    const operator = formattedError.operator || "unknown";
    console.error(`Assertion failed with operator: ${operator}`);
    console.group("Expected:");
    console.log(formattedError.expected);
    console.groupEnd();
    console.group("Actual:");
    console.log(formattedError.actual);
    console.groupEnd();
  } else {
    console.error(formattedError.message);
  }
};

export { isChaiAssertionError, formatChaiError, printChaiError };