import fs from "fs";
import path from "path";

export const fixtureDir = path.join(process.cwd(), "src", "tests", "fixtures");

export function getFixturePath(file: string) {
  return path.join(fixtureDir, file);
}

export function getFixtureFile(file: string): string {
  const fixtureFile = getFixturePath(file);
  return fs.readFileSync(fixtureFile, "utf-8");
}
