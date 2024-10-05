import { SlackFunctionTester } from "deno-slack-sdk/mod.ts";
import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import RandomUser from "./random_user.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import {
  afterEach,
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.224.0/testing/bdd.ts";

const { createContext } = SlackFunctionTester("random_user");
let mf = new MockFetch();

describe("RandomUser()", () => {
  beforeEach(() => {
    mf = new MockFetch();
    mf.intercept("https://slack.com/api/usergroups.users.list", {
      method: "POST",
    }).response(JSON.stringify({
      "ok": true,
      "users": [
        `group1_user1`,
        `group1_user2`,
      ],
    })).persist();
    mf.intercept("https://slack.com/api/users.getPresence", { method: "POST" })
      .response(JSON.stringify({
        "ok": true,
        "presence": "away",
      }));
    mf.intercept("https://slack.com/api/users.getPresence", { method: "POST" })
      .response(JSON.stringify({
        "ok": true,
        "presence": "active",
      })).persist();
  });
  afterEach(() => {
    mf.close();
  });
  it("return a user", async () => {
    const inputs = { users: ["user1"] };
    const { outputs, error } = await RandomUser(createContext({ inputs }));
    assertEquals(error, undefined);
    assertEquals(outputs?.user, "user1");
  });
  it("return a random user", async () => {
    const inputs = { users: ["user1", "user2"] };
    const { outputs, error } = await RandomUser(createContext({ inputs }));
    assertEquals(error, undefined);
    assertEquals(
      ["user1", "user2"].includes(outputs?.user as string),
      true,
    );
  });
  it("return a random user from a group", async () => {
    const inputs = {
      users: ["user1", "user2"],
      groups: ["group1"],
    };
    const { outputs, error } = await RandomUser(createContext({ inputs }));
    assertEquals(error, undefined);
    assertEquals(
      [
        "user1",
        "user2",
        "group1_user1",
        "group1_user2",
      ].includes(outputs?.user as string),
      true,
    );
  });
});
