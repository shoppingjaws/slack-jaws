import { Manifest } from "deno-slack-sdk/mod.ts";
import { RandomUser } from "./functions/slack/random_user.ts";
import { RotateUser, RotateUserList } from "./functions/slack/rotate_user.ts";
import { GithubCreateIssue } from "./functions/github/create_issue.ts";
import { GithubDispatchWorkflow } from "./functions/github/dispatch_workflow.ts";
import { NotionAddPageToDb } from "./functions/notion/add_page_to_db.ts";
import GitHubProvider from "./external_auth/github_provider.ts";
import NotionProvider from "./external_auth/notion_provider.ts";
import { NotionAppendParagraphToPage } from "./functions/notion/append_paragraph_to_page.ts";

export default Manifest({
  name: "slack-jaws",
  description: "Slack step collection",
  icon: "assets/slack_jaws.png",
  functions: [
    // Slack
    RandomUser,
    RotateUser,
    // GitHub
    GithubCreateIssue,
    GithubDispatchWorkflow,
    // Notion
    NotionAddPageToDb,
    NotionAppendParagraphToPage,
  ],
  workflows: [],
  events: [],
  datastores: [RotateUserList],
  outgoingDomains: [
    "api.github.com",
    "esm.sh",
    "api.notion.com",
    "notion.com",
  ],
  externalAuthProviders: [
    GitHubProvider,
    NotionProvider,
  ],
  botScopes: [
    "commands",
    "chat:write",
    "users:write",
    "chat:write.public",
    "datastore:read",
    "datastore:write",
  ],
});
