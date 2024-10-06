import { Manifest } from "deno-slack-sdk/mod.ts";
import { RandomUser } from "./functions/slack/random_user.ts";
import GitHubProvider from "./external_auth/github_provider.ts";
import { RotateUser, RotateUserList } from "./functions/slack/rotate_user.ts";
import { CreateIssue } from "./functions/github/create_issue.ts";
import { DispatchWorkflow } from "./functions/github/dispatch_workflow.ts";

export default Manifest({
  name: "slack-jaws",
  description: "Slack step collection",
  icon: "assets/default_new_app_icon.png",
  functions: [RandomUser, RotateUser, CreateIssue, DispatchWorkflow],
  workflows: [],
  events: [],
  datastores: [RotateUserList],
  outgoingDomains: [
    "api.github.com",
    "esm.sh",
  ],
  externalAuthProviders: [GitHubProvider],
  botScopes: [
    "commands",
    "chat:write",
    "users:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
