import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

export const XPostTweet = DefineFunction({
  callback_id: "x_post_tweet",
  title: "X: Post a tweet",
  source_file: "functions/x/post.ts",
  input_parameters: {
    properties: {
      xAccessTokenId: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: "x",
      },
    },
    required: [
      "xAccessTokenId",
    ],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  XPostTweet,
  async ({ inputs, client }) => {
    const token = await client.apps.auth.external.get({
      external_token_id: inputs.xAccessTokenId,
    });

    if (!token.ok) throw new Error("Failed to access auth token");

    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token.external_token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    return { outputs: {} };
  },
);
