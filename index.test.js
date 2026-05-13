const { describe, it } = require("node:test");
const assert = require("node:assert");

describe("App", () => {
  it("should load index without errors", () => {
    assert.doesNotThrow(() => require("./index"));
  });
});
