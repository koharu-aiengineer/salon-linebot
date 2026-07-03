import { LineBotClient } from "@line/bot-sdk";

export const lineClient = LineBotClient.fromChannelAccessToken({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});
