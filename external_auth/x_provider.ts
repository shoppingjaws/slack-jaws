import { DefineOAuth2Provider, Schema } from "deno-slack-sdk/mod.ts";
import "std/dotenv/load.ts";

const XProvider = DefineOAuth2Provider({
  provider_key: "x",
  provider_type: Schema.providers.oauth2.CUSTOM,
  options: {
    provider_name: "X.com",
    authorization_url: "https://twitter.com/i/oauth2/authorize",
    authorization_url_extras: {
      grant_type: "authorization_code",
      code_challenge: "challege",
      code_challenge_method: "plain",
      state: "state",
    },
    token_url: "https://api.x.com/2/oauth2/token",
    client_id: Deno.env.get("X_CLIENT_ID")!,
    scope: [
      "users.read",
      "offline.access",
    ],
    // use_pkce: true,
    // token_url_config: { use_basic_auth_scheme: true },
    identity_config: {
      // http_method_type: "POST",
      // headers: {
      //   "Content-Type": "application/x-www-form-urlencoded",
      // },
      body: {
        "code_verifier": "challenge",
      },
      url: "https://api.x.com/2/users/me",
      account_identifier: "$.data.username",
    },
  },
});

export default XProvider;
