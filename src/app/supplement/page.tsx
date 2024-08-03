"use client";

import { type CoreMessage } from "ai";
import { useState } from "react";
import { continueConversationWithData } from "../actions";
import { readStreamableValue } from "ai/rsc";
import { Trash } from "lucide-react";
import Markdown from "react-markdown";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function Chat() {
  const [messages, setMessages] = useState<CoreMessage[]>([]);
  const [input, setInput] = useState("");
  return (
    <div className="stretch mx-auto flex w-full max-w-md flex-col py-24">
      <div className="fixed right-0 m-5">
        <Trash onClick={() => setMessages([])} />
      </div>
      {messages.map((m, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          <Markdown>{m.content as string}</Markdown>
        </div>
      ))}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const newMessages: CoreMessage[] = [
            ...messages,
            { content: input, role: "user" },
          ];

          setMessages(newMessages);
          setInput("");

          const result = await continueConversationWithData(newMessages);

          if (typeof result === "string") {
            setMessages([
              ...newMessages,
              {
                role: "assistant",
                content: result,
              },
            ]);
            return;
          }

          for await (const content of readStreamableValue(result)) {
            setMessages([
              ...newMessages,
              {
                role: "assistant",
                content: content as string,
              },
            ]);
          }
        }}
      >
        <input
          className="fixed bottom-0 mb-8 w-full max-w-md rounded border border-gray-300 p-2 shadow-xl"
          value={input}
          placeholder="Analyze data..."
          onChange={(e) => setInput(e.target.value)}
        />
      </form>
    </div>
  );
}
