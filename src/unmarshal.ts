export class Unmarshal {
  static number(o: any, k: string): number {
    assert(typeof o[k] === "number");
    return o[k];
  }

  static optionalString(o: any, k: string): string | undefined {
    assert(typeof o[k] === "undefined" || typeof o[k] === "string");
    return o[k];
  }

  static string(o: any, k: string): string {
    assert(typeof o[k] === "string");
    return o[k];
  }

  static stringArray(o: any, k: string): string[] {
    const maybeStringArray = o[k];
    assert(Array.isArray(maybeStringArray));
    return maybeStringArray;
  }

  static optionalStringArray(o: any, k: string): string[] | undefined {
    const maybeStringArray = o[k];
    if (!maybeStringArray) {
      return;
    }
    assert(Array.isArray(maybeStringArray));
    return maybeStringArray;
  }
}

export function assert(
  cond: boolean | null | undefined,
  msg?: string
): asserts cond {
  if (!cond) {
    throw new Error(msg || "expected cond to be truthy");
  }
}
