import assert from "assert";
import type * as baretest from "baretest";
import { removeFlagCode } from "../remove_flag_code";
import { suite } from "./make_test_suite";

const makeBlockStatement = (body: string) => `{
  ${body};
}`;

const flagA = `FLAG_A`;

const condition = `flags.get(${flagA})`;

const consequent = `console.log('FLAG_A experiment enabled')`;
const consequentBlock = makeBlockStatement(consequent);

const ifStatementSource = `if (${condition}) ${consequentBlock}`;

const alternate = `console.log('FLAG_A experiment disabled')`;
const alternateBlock = makeBlockStatement(alternate);

const ifElseStatementSource = `${ifStatementSource} else ${alternateBlock}`;

const conditionalExpression = `${condition} ? ${consequent} : ${alternate}`;

export const removeFlagCodeTests = suite(
  "removeFlagCode",
  (test: baretest.Tester) => {
    test("keeps just the consequent for a simple if statement", () => {
      const flags = new Map([[flagA, true]]);
      const transformed = removeFlagCode({
        source: ifStatementSource,
        flags,
      });
      assert.strictEqual(transformed, consequentBlock);
    });

    test("keeps just the consequent for an if/else statement", () => {
      const flags = new Map([[flagA, true]]);
      const transformed = removeFlagCode({
        source: ifElseStatementSource,
        flags,
      });
      assert.strictEqual(transformed, consequentBlock);
    });

    test("replaces an if statement with nothing if test is false", () => {
      const flags = new Map([[flagA, false]]);
      const transformed = removeFlagCode({
        source: ifStatementSource,
        flags,
      });
      assert.strictEqual(transformed, "{}");
    });

    test("replaces an if/else statement with the alternate if test is false", () => {
      const flags = new Map([[flagA, false]]);
      const transformed = removeFlagCode({
        source: ifElseStatementSource,
        flags,
      });
      assert.strictEqual(transformed, alternateBlock);
    });

    test("replaces a conditional expression with the consequent", () => {
      const flags = new Map([[flagA, true]]);
      const transformed = removeFlagCode({
        source: conditionalExpression,
        flags,
      });
      assert.strictEqual(transformed, consequent + ";");
    });

    test("replaces a conditional expression with the alternate if test is false", () => {
      const flags = new Map([[flagA, false]]);
      const transformed = removeFlagCode({
        source: conditionalExpression,
        flags,
      });
      assert.strictEqual(transformed, alternate + ";");
    });
  }
);
