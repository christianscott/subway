import { removeFlagCodeTests } from "./remove_flag_code.tests";

!(async function () {
  await Promise.all([removeFlagCodeTests()]);
})();
