import estraverse from "estraverse";
import type * as estree from "estree";
import * as recast from "recast";

export type FlagValue = boolean;
export type Flags = Map<string, FlagValue>;

export function removeFlagCode({
  source,
  flags,
}: {
  source: string;
  flags: Flags;
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

function visitIfStatement(node: estree.IfStatement, flags: Flags) {
  const value = maybeGetFlagValue(node.test, flags);
  if (value == null) {
    return;
  }

  let replacement: estree.Statement;
  if (value) {
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
  flags: Flags
) {
  const value = maybeGetFlagValue(node.test, flags);
  if (value == null) {
    return;
  }

  const replacement = value ? node.consequent : node.alternate;
  return replacement;
}

function maybeGetFlagValue(node: estree.Expression, flags: Flags) {
  if (
    // f()
    node.type !== "CallExpression" ||
    // X.Y()
    node.callee.type !== "MemberExpression" ||
    // obj.Y()
    node.callee.object.type !== "Identifier" ||
    // obj.prop()
    node.callee.property.type !== "Identifier" ||
    // flags.prop()
    node.callee.object.name !== "flags" ||
    // flags.get()
    node.callee.property.name !== "get" ||
    // flags.get(?)
    node.arguments.length !== 1
  ) {
    return;
  }

  const [maybeFlag] = node.arguments;
  if (
    maybeFlag == null ||
    // flags.get(SOME_FLAG)
    maybeFlag.type !== "Identifier"
  ) {
    return;
  }

  return flags.get(maybeFlag.name);
}

const Builders = {
  blockStatement(body?: estree.Statement[]): estree.BlockStatement {
    return recast.types.builders.blockStatement(
      (body as any[]) ?? []
    ) as estree.BlockStatement;
  },
};
