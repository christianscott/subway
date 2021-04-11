import * as sourcemapCodec from "sourcemap-codec";
import { assert, Unmarshal } from "./unmarshal";

type SourceMapSegment = {
  generatedCodeColumn: number;
  sourceLocation: SourceLocation;
  name?: string;
};

type SourceMapLine = SourceMapSegment[];

type SourceMapMappings = SourceMapLine[];

class Source {
  constructor(readonly path: string) {}
}

class SourceLocation {
  constructor(
    readonly line: number,
    readonly column: number,
    readonly source: Source
  ) {}

  toString() {
    return `${this.source.path}:${this.line}:${this.column}`;
  }
}

export class SourceMap {
  readonly mappings: SourceMapMappings;
  constructor(
    readonly sources: readonly string[],
    readonly names: readonly string[],
    encodedMappings: string,
    readonly file?: string,
    readonly sourceRoot?: string,
    readonly sourcesContent?: readonly string[]
  ) {
    this.mappings = SourceMap.decodeMappings(
      encodedMappings,
      this.sources,
      this.names
    );
  }

  private static decodeMappings(
    encodedMappings: string,
    sources: readonly string[],
    names: readonly string[]
  ): SourceMapMappings {
    const mappings: SourceMapMappings = [];
    for (const decodedLine of sourcemapCodec.decode(encodedMappings)) {
      const line: SourceMapLine = [];

      for (const segment of decodedLine) {
        const [
          generatedCodeColumn,
          sourceIndex,
          sourceCodeLine,
          sourceCodeColumn,
          nameIndex,
        ] = segment;

        const name =
          nameIndex != null ? assertExists(names[nameIndex]) : undefined;
        const source = new Source(sources[assertExists(sourceIndex)]);

        line.push({
          generatedCodeColumn: assertExists(generatedCodeColumn),
          sourceLocation: new SourceLocation(
            assertExists(sourceCodeLine),
            assertExists(sourceCodeColumn),
            source
          ),
          name,
        });
      }

      mappings.push(line);
    }

    return mappings;
  }

  outputLocationFor([line, column]: [line: number, column: number]):
    | number
    | undefined {
    const segments = this.mappings[line];
    if (segments == null) {
      return;
    }

    for (const segment of segments) {
      if (segment.sourceLocation.column === column) {
        return segment.generatedCodeColumn;
      }
    }
  }

  static unmarshal(sourcemap: string): SourceMap {
    const obj = JSON.parse(sourcemap);

    const version = Unmarshal.number(obj, "version");
    assert(version === 3, `expected sourcemap version to be 3, got ${version}`);

    return new SourceMap(
      Unmarshal.stringArray(obj, "sources"),
      Unmarshal.stringArray(obj, "names"),
      Unmarshal.string(obj, "mappings"),
      Unmarshal.optionalString(obj, "file"),
      Unmarshal.optionalString(obj, "sourceRoot"),
      Unmarshal.optionalStringArray(obj, "sourcesContent")
    );
  }
}

function assertExists<T>(x: T | null | undefined): T {
  assert(x != null);
  return x;
}
