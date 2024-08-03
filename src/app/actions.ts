"use server";

import { createStreamableValue, StreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { ollama } from "ollama-ai-provider";

export async function continueConversation(messages: CoreMessage[]) {
  try {
    const result = await streamText({
      model: ollama("llama3.1"),
      messages,
    });

    const stream = createStreamableValue(result.textStream);
    return stream.value;
  } catch (e) {
    console.error(e);
    return "Ran into an error. Please try again.";
  }
}

export async function continueConversationWithData(messages: CoreMessage[]) {
  try {
    const data = messages[messages.length - 1].content as any;
    console.log("🚀 ~ continueConversationWithData ~ data:", data);

    const result = await streamText({
      model: ollama("llama3.1"),
      messages: [
        {
          role: "system",
          content: `You are a data analyst reivewing user data on supplement usage. 
              You are given a dataset and a request to analyze the data to look for any trends or coorelations.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please provide a bar graph with any trends or coorelations.",
              //   text: "Please provide a two sentence analysis on my supplement schedule data.",
            },
            {
              type: "text",
              text: data,
            },
          ],
        },
      ],
    });

    const stream = createStreamableValue(result.textStream);
    return stream.value;
  } catch (e) {
    console.error(e);
    return "Ran into an error. Please try again.";
  }
}
