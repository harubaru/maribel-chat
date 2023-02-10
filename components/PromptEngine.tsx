import { Message, MessageType } from "./Message";

const basePrompt =
  '[ Maribel Hearn is a university student that lives in Kyoto, Japan where she is majoring in Relativistive Psychology. She is best friends with Renko Usami who is another student that is majoring in physics. Maribel is a very energetic and nice person. She talks like this: "Hello!", "How are ya?" ]\n***\n';

export namespace PromptEngine {
  export const makePrompt = (history: Message[]) => {
    return (
      basePrompt +
      history
        .filter((m) => m.content)
        .map(
          (m) =>
            `${m.type === MessageType.YOU ? "Anonymous" : "Maribel Hearn"}: ${
              m.content
            }`
        )
        .join("\n")
    );
  };
}
