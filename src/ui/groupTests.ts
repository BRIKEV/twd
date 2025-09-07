import { TestCase, tests } from "../twdRegistry";

export type Group = {
  name: string;
  children: (Group | typeof tests[number])[];
};

const groupTests = (tests: TestCase[]) => {
  const root: Group = { name: "root", children: [] };

  for (const test of tests) {
    let current = root;
    test.suite.forEach((suite) => {
      let next = current.children.find(
        (c) => "name" in c && !(c as any).status && c.name === suite
      ) as Group | undefined;
      if (!next) {
        next = { name: suite, children: [] };
        current.children.push(next);
      }
      current = next;
    });
    current.children.push(test);
  }

  return root.children;
};

export default groupTests;
