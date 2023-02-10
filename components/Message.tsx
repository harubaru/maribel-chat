/* eslint-disable @next/next/no-img-element */
import { Wand2 } from "lucide-react";
import React from "react";
import { Button } from "./Button";
import { ChatBar } from "./ChatBar";
import { MessageList } from "./MessageList";
import { PromptEngine } from "./PromptEngine";
import { Settings } from "./Settings";

export function Message({ id }: { id: string }) {
  const [message, editMessage] = MessageList.useMessage(id);

  return (
    <div className={`my-2 w-full hover:bg-black/10`}>
      <div
        className={`mx-auto max-w-[60rem] px-2 lg:px-0 flex flex-col w-full ${
          message.type === "you" ? "items-end" : "items-start"
        }`}
      >
        <div className="flex flex-row gap-2 items-center">
          {message.timestamp && (
            <p className="text-white/30 self-end">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          )}
          {/* <img
            className="w-6 h-6 rounded-full"
            src={
              message.type === "you"
                ? "https://cdn.discordapp.com/attachments/940396199993819237/1051090899343528016/360_F_64678017_zUpiZFjj04cnLri7oADnyMH0XBYyQghG.jpg"
                : "https://cdn.discordapp.com/attachments/940396199993819237/1051090392117944330/image0_cropped.png"
            }
            alt="Avatar"
          /> */}
          <h1 className="font-semibold text-white">
            {message.type === "you" ? "You" : "Maribel Hearn"}
          </h1>
        </div>
        <p
          className={`text-white/75 ${
            message.type === MessageType.YOU && "text-right"
          } break-word`}
        >
          {message.content}
        </p>
        {message.error && <p className="text-red-500">{message.error}</p>}
        {message.loading && (
          <div className="flex flex-row gap-1 my-3">
            <div className="animate-pulse bg-white/25 w-3 h-3 rounded-full" />
            <div className="animate-pulse bg-white/25 delay-75 w-3 h-3 rounded-full" />
            <div className="animate-pulse bg-white/25 delay-150 w-3 h-3 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}

export enum MessageType {
  YOU = "you",
  BOT = "bot",
  SYSTEM = "system",
}

export type Message = {
  type: MessageType;
  id: string;
  timestamp: number;
  content: string;
  loading: boolean;
  buttons: Button[];
  error: string | null;
};

export type Artifact = {
  image: string;
  seed: number;
};

const endpoint = "https://api.transformer.chat";

export namespace Message {
  export const makeId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  export const b64toBlob = (b64Data: string, contentType = "") => {
    // Decode the base64 string into a new Buffer object
    const buffer = Buffer.from(b64Data, "base64");

    // Create a new blob object from the buffer
    return new Blob([buffer], { type: contentType });
  };

  export const sendPromptMessage = async (
    prompt: string,
    modifiers?: string
  ) => {
    if (!prompt && !modifiers) return;

    const settings = Settings.use.getState().settings;

    const newUserMsg = {
      type: MessageType.YOU,
      id: Message.makeId(),
      content: prompt,
      timestamp: Date.now(),
      loading: false,
      buttons: [],
      error: null,
    };

    // get the last 10 messages
    const messages = MessageList.use.getState().messages;
    const last10 = [...Object.values(messages).slice(-10), newUserMsg];

    const builtPrompt = PromptEngine.makePrompt(last10) + "\nMaribel Hearn:";

    console.log(builtPrompt);

    ChatBar.use.getState().setPrompt("");

    MessageList.use.getState().addMessage(newUserMsg);

    await new Promise((r) => setTimeout(r, 400));
    const uid = makeId();
    const newMsg: Message = {
      type: MessageType.BOT,
      content: "",
      loading: true,
      buttons: [],
      id: uid,
      timestamp: Date.now(),
      error: null,
    };
    MessageList.use.getState().addMessage(newMsg);

    const res = await fetch(`${endpoint}/completion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: builtPrompt,
        engine: "lotus-12b",
        max_new_tokens: 24,
        temperature: 0.75,
        do_sample: true,
        num_return_sequences: 1,
        stop_sequence: "\n",
      }),
    });

    if (!res.ok) {
      switch (res.status) {
        case 400:
          newMsg.error = "Bad request";
          break;
        case 429:
          newMsg.error = "You're too fast! Slow down!";
          break;
        default:
          newMsg.error = "Something went wrong";
          break;
      }
      newMsg.loading = false;
      newMsg.buttons = [
        {
          text: "Retry",
          id: "regenerate",
        },
      ];
      MessageList.use.getState().editMessage(uid, newMsg);
      return;
    }

    const data = await res.json();

    newMsg.loading = false;
    newMsg.content = data[0].generated_text.replace(builtPrompt, "").trim();

    console.log("new msg", newMsg);
    MessageList.use.getState().editMessage(uid, newMsg);
  };
}
