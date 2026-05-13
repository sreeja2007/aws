const { describe, it } = require("node:test");
const assert = require("node:assert");

describe("App", () => {
  it("should have express as a dependency", () => {
    assert.ok(require.resolve("express"));
  });
});
