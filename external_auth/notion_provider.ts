import { DefineOAuth2Provider, Schema } from "deno-slack-sdk/mod.ts";
import "std/dotenv/load.ts";

const NotionProvider = DefineOAuth2Provider({
  provider_key: "notion",
  provider_type: Schema.providers.oauth2.CUSTOM,
  options: {
    provider_name: "Notion",
    authorization_url:
      "https://api.notion.com/v1/oauth/authorize?response_type=code&owner=user",
    token_url: "https://api.notion.com/v1/oauth/token",
    client_id: Deno.env.get("NOTION_CLIENT_ID")!,
    scope: [],
    token_url_config: {
      use_basic_auth_scheme: true,
    },
    identity_config: {
      headers: {
        "Notion-Version": "2022-06-28",
      },
      url: "https://api.notion.com/v1/users/me",
      account_identifier: "$.name",
    },
  },
});

export default NotionProvider;
