import { foo } from "./foo.tests";
import { removeFlagCodeTests } from "./remove_flag_code.tests";

!(async function () {
  await foo();
  await removeFlagCodeTests();
})();
