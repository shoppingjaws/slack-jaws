import {
  DefineFunction,
  Schema,
  SlackAPI,
  SlackFunction,
} from "deno-slack-sdk/mod.ts";
import "std/dotenv/load.ts";

export const RotateUser = DefineFunction({
  callback_id: "rotate_user",
  title: "Rotate user",
  description: "Rotate user in a list",
  source_file: "./functions/slack/rotate_user.ts",
  input_parameters: {
    properties: {
      name: {
        title: "Rotation Name",
        type: Schema.types.string,
        hint: "This name must be unique for identifying the rotation",
      },
      users: {
        title: "Users to rotate",
        type: Schema.types.array,
        items: { type: Schema.slack.types.user_id },
      },
    },
    required: ["users", "name"],
  },
  output_parameters: {
    properties: {
      chosen: {
        title: "Chosen user",
        type: Schema.slack.types.user_id,
      },
    },
    required: ["chosen"],
  },
});

export default SlackFunction(
  RotateUser,
  async ({ inputs, token, env }) => {
    const slack = SlackAPI(token);
    console.log(env);
    // inputs.users;
    const last_chosen_user_column = await slack.apps.datastore.get<
      typeof RotateUserList.definition
    >({
      datastore: "rotate_user_list",
      id: inputs.name,
    });
    const last_chosen_user =
      last_chosen_user_column.item.last_chosen_user != undefined
        ? last_chosen_user_column.item.last_chosen_user
        : inputs.users[0];
    const last_chosen_user_index = inputs.users.findIndex((u) =>
      u === last_chosen_user
    );
    const chosen_user_index = last_chosen_user_index +
      1 % inputs.users.length;
    await slack.apps.datastore.put<typeof RotateUserList.definition>({
      datastore: "rotate_user_list",
      item: {
        id: inputs.name,
        last_chosen_user: inputs.users[chosen_user_index],
      },
    });
    return { outputs: { chosen: inputs.users[chosen_user_index] } };
  },
);

import { DefineDatastore } from "deno-slack-sdk/mod.ts";
export const RotateUserList = DefineDatastore({
  name: "rotate_user_list",
  primary_key: "id",
  attributes: {
    id: {
      type: Schema.types.string,
    },
    last_chosen_user: {
      type: Schema.slack.types.user_id,
    },
  },
});
