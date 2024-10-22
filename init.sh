#!/bin/sh

TEAM_ID=$(op item get "Slack Platform" --reveal --fields TEAM_ID)

slack external-auth add-secret --team "$TEAM_ID" --provider github --secret "$(op item get "Slack Platform" --reveal --fields GITHUB_CLIENT_SECRET)"
slack external-auth add-secret --team "$TEAM_ID" --provider notion --secret "$(op item get "Slack Platform" --reveal --fields NOTION_CLIENT_SECRET)"
slack external-auth add-secret --team "$TEAM_ID" --provider x --secret "$(op item get "Slack Platform" --reveal --fields X_CLIENT_SECRET)"