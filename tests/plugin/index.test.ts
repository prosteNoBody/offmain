import { expect, test } from "vitest";
import { name } from "../../src/plugin/index.js";

test("plugin has a name", () => {
  expect(name).toBe("offmain");
});
