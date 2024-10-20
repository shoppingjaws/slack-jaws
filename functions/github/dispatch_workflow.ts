import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";
import { Octokit } from "https://esm.sh/octokit@4.0.2?dts@4.0.2";
import "std/dotenv/load.ts";
import { i18n } from "/utils/i18n.ts";

export const GithubDispatchWorkflow = DefineFunction({
  callback_id: "github_dispatch_workflow",
  title: i18n(
    "Github: Dispatch a GitHub workflow",
    "Github: GitHubのワークフローを呼び出す",
  ),
  description: i18n(
    "Github: Dispatch a GitHub workflow",
    "Github: GitHubのワークフローを呼び出す",
  ),
  source_file: "functions/github/dispatch_workflow.ts",
  input_parameters: {
    properties: {
      githubAccessTokenId: {
        type: Schema.slack.types.oauth2,
        oauth2_provider_key: "github",
      },
      owner: {
        type: Schema.types.string,
        description: i18n("Repository OWNER", "リポジトリのOWNER"),
        hint: i18n(
          "Github Organization or User",
          "リポジトリのOrganization or User",
        ),
      },
      repo: {
        type: Schema.types.string,
        description: "Repository REPO",
        hint: "Github Repository",
      },
      ref: {
        type: Schema.types.string,
        description: "Branch name to dispatch",
        // default: "main",
      },
      workflowFileName: {
        type: Schema.types.string,
        description: "Workflow file name",
        examples: ["main.yaml"],
      },
      body: {
        type: Schema.types.string,
        description: "Workflow input parameters",
        examples: ['{"name":"Hello world!"}'],
      },
    },
    required: [
      "githubAccessTokenId",
      "owner",
      "repo",
      "ref",
      "workflowFileName",
      "body",
    ],
  },
  output_parameters: {
    properties: {},
    required: [],
  },
});

export default SlackFunction(
  GithubDispatchWorkflow,
  async ({ inputs, client }) => {
    const token = await client.apps.auth.external.get({
      external_token_id: inputs.githubAccessTokenId,
    });
    if (!token.ok) throw new Error("Failed to access auth token");
    const octkit = new Octokit({
      auth: token.external_token,
    });

    const res = await octkit.rest.actions.createWorkflowDispatch({
      repo: inputs.repo,
      owner: inputs.owner,
      workflow_id: inputs.workflowFileName,
      ref: inputs.ref,
      inputs: JSON.parse(inputs.body),
    });
    if (res.status !== 204) {
      return {
        outputs: { error: "Failed to call createWorkflowDispatch event" },
      };
    }
    return { outputs: {} };
  },
);
