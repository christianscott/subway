import baretest from "baretest";

export function suite(
  name: string,
  setUpTests: (test: baretest.Tester) => void | Promise<void>
) {
  const test = baretest(name);
  setUpTests(test);
  return async () => {
    await test.run();
  };
}
