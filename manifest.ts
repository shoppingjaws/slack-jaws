import { Manifest } from "deno-slack-sdk/mod.ts";
import { RandomUser } from "./functions/slack/random_user.ts";
import GitHubProvider from "./external_auth/github_provider.ts";

export default Manifest({
  name: "slack-jaws",
  description: "Slack step collection",
  icon: "assets/default_new_app_icon.png",
  functions: [RandomUser],
  workflows: [],
  events: [],
  outgoingDomains: ["api.github.com"],
  externalAuthProviders: [GitHubProvider],
  botScopes: [
    "commands",
    "chat:write",
    "users:write",
    "chat:write.public",
  ],
});
