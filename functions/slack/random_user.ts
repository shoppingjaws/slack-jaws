import {
  DefineFunction,
  Schema,
  SlackAPI,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";

export const RandomUser = DefineFunction({
  callback_id: "random_user",
  title: "Choose a random user",
  description: "Choose a random user from a list of users",
  source_file: "./functions/slack/random_user.ts",
  input_parameters: {
    properties: {
      users: {
        title: "Users to choose from",
        type: Schema.types.array,
        items: { type: Schema.slack.types.user_id },
      },
      groups: {
        title: "Groups to choose from",
        type: Schema.types.array,
        items: { type: Schema.slack.types.usergroup_id },
      },
      active_user_only: {
        title: "Filter out inactive users",
        type: Schema.types.boolean,
        default: false,
      },
    },
    required: [],
  },
  output_parameters: {
    properties: {
      user: {
        title: "Chossen one",
        type: Schema.slack.types.user_id,
      },
    },
    required: ["user"],
  },
});

export default SlackFunction(
  RandomUser,
  async ({ inputs, token }) => {
    const slack = SlackAPI(token);

    // get users from groups
    const groups = inputs.groups || [];
    const fetch_users_from_group_task = groups.map((g) =>
      slack.usergroups.users.list({ usergroup: g })
    );
    const groups_to_users_list_result = await Promise.all(
      fetch_users_from_group_task,
    );
    const users_from_groups = groups_to_users_list_result.map((r) =>
      r.users as string[]
    ).flat();

    // get users ... extract unique users
    const users = [...new Set(inputs.users?.concat(users_from_groups))].filter(
      (u) => u !== undefined,
    );
    if (!users) {
      throw new Error("No users to choose from");
    }
    console.debug(`Users to choose from: ${users.length}`);
    // filter out inactive users if flag is set
    if (inputs.active_user_only === true) {
      console.debug("Filtering out inactive users");
      const fetch_users_presence_task = users.map((u) =>
        slack.users.getPresence({ user: u }).then((r) => {
          return {
            res: r,
            user: u,
          };
        })
      );
      const fetch_users_presence_result = await Promise.all(
        fetch_users_presence_task,
      );
      console.debug(
        fetch_users_presence_result.map((r) => `${r.user} - ${r.res.presence}`),
      );
      const active_users = fetch_users_presence_result.filter((r) =>
        r.res.ok && r.res.presence === "active"
      ).map((r) => r.user);
      users.splice(0, users.length, ...active_users);
    }
    if (users.length === 0) {
      throw new Error("No users to choose from");
    }

    const chosen = users[Math.floor(Math.random() * users.length)];
    return { outputs: { user: chosen } };
  },
);
