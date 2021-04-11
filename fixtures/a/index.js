import { flags, FLAG_A } from "../lib/flags";

if (flags.enabled(FLAG_A)) {
  console.log("FLAG_A is enabled!");
} else {
  console.log("FLAG_A is disabled");
}
