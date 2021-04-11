import assert from "assert";
import estraverse from "estraverse";
import type * as estree from "estree";
import path from "path";
import * as recast from "recast";
import { suite } from "./make_test_suite";
import { SourceMap } from "../sourcemap";
import { getFixtureFile, getFixturePath } from "./fixtures";

export const foo = suite("foo", (test) => {
  const compiled = getFixtureFile("a/dist/index.js");
  const sourcemap = SourceMap.unmarshal(getFixtureFile("a/dist/index.js.map"));

  const fixtureADist = getFixturePath("a/dist");
  const flagsLibFile = getFixturePath("lib/flags.js");
  const flagsLibSourceIdx = sourcemap.sources
    .map((source) => path.join(fixtureADist, source))
    .indexOf(flagsLibFile);

  const flagsLib =
    sourcemap.sourcesContent && sourcemap.sourcesContent[flagsLibSourceIdx];
  assert(flagsLib);

  let exportDeclVar: estree.VariableDeclaration;
  const ast = recast.parse(flagsLib, {
    range: true,
  });
  estraverse.traverse(ast, {
    enter(this: estraverse.Controller, node) {
      if (
        node.type !== "ExportNamedDeclaration" ||
        node.declaration == null ||
        node.declaration.type !== "VariableDeclaration" ||
        node.declaration.declarations.length !== 1
      ) {
        return;
      }

      const [declarator] = node.declaration.declarations;
      if (
        declarator.type !== "VariableDeclarator" ||
        declarator.id.type !== "Identifier" ||
        declarator.id.name !== "flags"
      ) {
        return;
      }

      // found it!
      exportDeclVar = node.declaration;
      this.break();
    },
    fallback: "iteration",
  });

  test("sourcemap", () => {
    const { range } = exportDeclVar;
    assert.ok(range);
    const outputLocation = sourcemap.outputLocationFor([0, range[0]]);
    assert.ok(outputLocation);
  });
});
