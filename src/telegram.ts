import Telegram, { Message } from "node-telegram-bot-api";
import DB from "./db";
import { createDecipher } from "crypto";

const botToken: string = process.env.BOT_TOKEN || "";

(async () => {
  const telegram = new Telegram(
    botToken,
    { polling: true }
  );
  const chatId = process.env.CHAT_ID || 0;
  telegram.onText(/\/downtime/, handleText);
  async function handleText(msg: Message) {
    let response = await replyDowntime();
    if (msg.chat.id == chatId) {
      await sendData(response)
    };
  }

  async function replyDowntime(): Promise<string> {
    let db = await DB();
    let data = db.get('data').filter((res) => res.status == false);
    if (data.isEmpty()) return "No downtime found.";
    let {created: earliest} = data.minBy('created').value();
    let since = (new Date().getTime() - earliest) / 1000;
    let duration = since > 3600 ? `${Math.round(since / 3600)} hours ago` : `${Math.round(since / 60)} minutes ago`; 
    let hello = data
      .countBy("host")
      .entries()
      .map(([host, count]) => `${host} was offline for ~${count * 10} seconds since ${duration}`)
      .join("\n")
      .value();
    return hello;
  }

  async function sendData(message: string) {
    await telegram.sendMessage(chatId, message);
  }
})();
