const assert = require("chai").assert;
const commandListener = require("../groupmebot").commandListener;

describe("GroupMeBot", function () {
  it("commandListener should return true", function () {
    let result = commandListener("@standings");
    assert.isTrue(result, "@standings is a command");
  });

  it("commandListener should return false", function () {
    let result = commandListener("What time is it?");
    assert.isFalse(result, '"What time is it?" is not a command');
  });


});
