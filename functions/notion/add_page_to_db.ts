import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { PageObjectResponse } from "https://deno.land/x/notion_sdk@v2.2.3/src/api-endpoints.ts";
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
export const NotionAddPageToDb = DefineFunction({
  callback_id: "notion_add_page_to_db",
  title: "Notion: Add a notinon page to database",
  description: "Create a notion page",
  source_file: "./functions/notion/add_page_to_db.ts",
  input_parameters: {
    properties: {
      notion_access_token_id: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: "notion",
      },
      database_id: {
        title: "Notion database id to create",
        type: Schema.types.string,
      },
      title: {
        title: "Page title",
        type: Schema.types.string,
      },
    },
    required: ["notion_access_token_id", "database_id", "title"],
  },
  output_parameters: {
    properties: {
      page_id: {
        title: "Created notion page id",
        type: Schema.types.string,
      },
      page_url: {
        title: "Created notion page url",
        type: Schema.types.string,
      },
    },
    required: ["page_id", "page_url"],
  },
});

export default SlackFunction(
  NotionAddPageToDb,
  async ({ inputs, client }) => {
    const token = await client.apps.auth.external.get({
      external_token_id: inputs.notion_access_token_id,
    });
    if (token.error) {
      return { error: token.error };
    }
    const notion = new Client({ auth: token.external_token });
    const page = await notion.pages.create({
      parent: { database_id: inputs.database_id },
      properties: {},
    });
    if (page.object !== "page") {
      return { error: "Failed to create a page" };
    }

    const p = page as PageObjectResponse;
    const titlePropName = Object.entries(p.properties).find(([_, v]) =>
      v.type === "title"
    )?.[0];
    if (!titlePropName) {
      return { error: "Failed to find title property" };
    }
    await notion.pages.update({
      page_id: p.id,
      properties: {
        [titlePropName]: {
          title: [{ "text": { "content": inputs.title } }],
        },
      },
    });
    return { outputs: { page_id: p.id, page_url: p.url } };
  },
);
