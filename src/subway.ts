import * as fs from "fs";
import * as path from "path";
import { SourceMap } from "./sourcemap";

function main() {
  const fixture = "./fixtures/a";
  const output = fs.readFileSync(
    path.join(fixture, "dist", "index.js"),
    "utf-8"
  );
  const sourcemap = SourceMap.unmarshal(
    fs.readFileSync(path.join(fixture, "dist", "index.js.map"), "utf-8")
  );
}

main();
