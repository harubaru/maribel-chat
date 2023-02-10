import { Message, MessageType } from "./Message";
import { MessageList } from "./MessageList";

export function Button({ btn, message }: { btn: Button; message: Message }) {

  return (
    <button
      className="border-white/10 border rounded px-3 py-1 text-white/75 font-semibold hover:bg-backgroundSecondary hover:text-white/100 duration-200"
      onClick={() => {
        if (btn.id == "regenerate") {
          Message.sendPromptMessage(message.content);
        } else if (btn.id == "chosen") {
          const newMsg: Message = {
            type: MessageType.BOT,
            content: btn.text,
            loading: true,
            buttons: [],
            id: Message.makeId(),
            timestamp: Date.now(),
            error: null,
          };
          MessageList.use.getState().editMessage(message.id, newMsg);

        }
      }}
    >
      {btn.text}
    </button>
  );
}

export type Button = {
  text: string;
  id: string;
};
