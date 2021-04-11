import estraverse from "estraverse";
import * as recast from "recast";

export function removeFlagCode({
  source,
  flags,
}: {
  source: string;
  flags: Map<string, boolean>;
}) {
  const ast = recast.parse(source);

  const fixed = estraverse.replace(ast, {
    enter(node) {
      if (
        // if (...) {...}
        node.type !== "IfStatement" ||
        // if (f()) {...}
        node.test.type !== "CallExpression" ||
        // if (X.Y()) {...}
        node.test.callee.type !== "MemberExpression" ||
        // if (obj.Y()) {...}
        node.test.callee.object.type !== "Identifier" ||
        // if (obj.prop()) {...}
        node.test.callee.property.type !== "Identifier" ||
        // if (flags.prop()) {...}
        node.test.callee.object.name !== "flags" ||
        // if (flags.get()) {...}
        node.test.callee.property.name !== "get" ||
        // if (flags.get(?)) {...}
        node.test.arguments.length !== 1
      ) {
        return;
      }

      const [maybeFlag] = node.test.arguments;
      if (
        // if (flags.get(Z)) {...}
        maybeFlag.type !== "Identifier" ||
        // if (flags.get(Z)) {...}
        !flags.has(maybeFlag.name)
      ) {
        return;
      }

      const enabled = flags.get(maybeFlag.name)!;
      let replacement: any;
      if (enabled) {
        replacement = node.consequent;
      } else {
        replacement = node.alternate ?? node;
      }

      if (replacement !== node && replacement.type !== "BlockStatement") {
        replacement = recast.types.builders.blockStatement([
          replacement as any,
        ]);
      }

      return replacement;
    },
    fallback: "iteration",
  });

  return recast.prettyPrint(fixed).code;
}
