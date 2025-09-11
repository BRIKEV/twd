export const assertionMessage = (valid: boolean, isNegated: boolean, correctMessage: string, errorMessage: string) => {
  if (!valid && !isNegated) {
    throw new Error(errorMessage);
  } else if (valid && isNegated) {
    throw new Error(
      errorMessage
        .replace("to be", "to not be")
        .replace("to have", "to not have")
        .replace("to contain", "to not contain")
    );
  }
  return correctMessage;
};
