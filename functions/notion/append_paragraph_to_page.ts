import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { Client } from "https://deno.land/x/notion_sdk@v2.2.3/src/mod.ts";
export const NotionAppendParagraphToPage = DefineFunction({
  callback_id: "notion_append_paragraph_to_page",
  title: "Notion: Append Paragraph to Page",
  source_file: "./functions/notion/append_paragraph_to_page.ts",
  input_parameters: {
    properties: {
      notion_access_token_id: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: "notion",
      },
      page_id: {
        title: "Notion database id to create",
        type: Schema.types.string,
      },
      text: {
        title: "text",
        type: Schema.slack.types.rich_text,
      },
    },
    required: ["notion_access_token_id", "page_id", "text"],
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
  NotionAppendParagraphToPage,
  async ({ inputs, client }) => {
    const token = await client.apps.auth.external.get({
      external_token_id: inputs.notion_access_token_id,
    });
    if (token.error) {
      return { error: token.error };
    }
    type SlackRichTextElement = { type: "text"; text: string } | {
      type: "user";
      user_id: string;
    };
    const ele = inputs.text[0].elements as SlackRichTextElement[];
    const rich_text = ele.map((e) => {
      switch (e.type) {
        case "text":
          return { text: { content: e.text } };
        default:
          console.log(`type ${e.type} is not supported.`);
          return undefined;
      }
    }).filter((f) => f !== undefined);
    const notion = new Client({ auth: token.external_token });
    const page = await notion.blocks.children.append({
      block_id: inputs.page_id,
      children: [
        {
          type: "paragraph",
          "paragraph": {
            "rich_text": rich_text,
          },
        },
      ],
    });
    console.log(page);
    return { outputs: { page_id: inputs.page_id, page_url: "p.url" } };
  },
);
