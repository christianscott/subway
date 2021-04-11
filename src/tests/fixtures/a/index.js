import { flags as otherFlags } from "../lib/not_flags";
import { flags, FLAG_A } from "../lib/flags";

if (flags.enabled(FLAG_A)) {
  console.log("FLAG_A is enabled!");
  console.log(otherFlags);
} else {
  console.log("FLAG_A is disabled");
}
