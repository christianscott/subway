import estraverse from "estraverse";
import type * as estree from "estree";
import * as recast from "recast";

export function removeFlagCode({
  source,
  flags,
}: {
  source: string;
  flags: Map<string, boolean>;
}): string {
  const ast = recast.parse(source);

  const fixed = estraverse.replace(ast, {
    enter(node) {
      switch (node.type) {
        case "IfStatement":
          return visitIfStatement(node, flags);
        case "ConditionalExpression":
          return visitConditionalExpression(node, flags);
        default:
          return;
      }
    },
    fallback: "iteration",
  });

  const { code } = recast.prettyPrint(fixed, {
    tabWidth: 2,
    quote: "single",
  });

  return code;
}

function visitIfStatement(
  node: estree.IfStatement,
  flags: Map<string, boolean>
) {
  if (
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
  let replacement: estree.Statement;
  if (enabled) {
    replacement = node.consequent;
  } else {
    replacement = node.alternate ?? Builders.blockStatement(); // empty block if there is no alternate
  }

  if (replacement !== node && replacement.type !== "BlockStatement") {
    replacement = Builders.blockStatement([replacement as any]);
  }

  return replacement;
}

function visitConditionalExpression(
  node: estree.ConditionalExpression,
  flags: Map<string, boolean>
) {
  const { test } = node;

  const maybeFlag = maybeGetFlagFromTest(test);
  if (
    maybeFlag == null ||
    // if (flags.get(Z)) {...}
    maybeFlag.type !== "Identifier" ||
    // if (flags.get(Z)) {...}
    !flags.has(maybeFlag.name)
  ) {
    return;
  }

  const replacement = flags.get(maybeFlag.name)!
    ? node.consequent
    : node.alternate;

  return replacement;
}

function maybeGetFlagFromTest(node: estree.Expression) {
  if (
    // if (f()) {...}
    node.type !== "CallExpression" ||
    // if (X.Y()) {...}
    node.callee.type !== "MemberExpression" ||
    // if (obj.Y()) {...}
    node.callee.object.type !== "Identifier" ||
    // if (obj.prop()) {...}
    node.callee.property.type !== "Identifier" ||
    // if (flags.prop()) {...}
    node.callee.object.name !== "flags" ||
    // if (flags.get()) {...}
    node.callee.property.name !== "get" ||
    // if (flags.get(?)) {...}
    node.arguments.length !== 1
  ) {
    return;
  }

  const [maybeFlag] = node.arguments;
  return maybeFlag;
}

const Builders = {
  blockStatement(body?: estree.Statement[]): estree.BlockStatement {
    return recast.types.builders.blockStatement(
      (body as any[]) ?? []
    ) as estree.BlockStatement;
  },
};
