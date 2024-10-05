import { SlackAPIClient } from "deno-slack-sdk/deps.ts";

export async function GetEmailsFromSlackUsers(
  userIds: string[],
  slack: SlackAPIClient,
): Promise<string[]> {
  const tasks = userIds.map((id) => slack.users.info({ user: id }));
  const results = await Promise.all(tasks);
  const slack_user_emails = results.filter((r) => r.ok).map((r) =>
    r.user.profile.email as string
  );
  return slack_user_emails;
}
