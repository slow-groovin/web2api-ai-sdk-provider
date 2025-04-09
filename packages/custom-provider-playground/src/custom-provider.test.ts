import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCustomProvider, CustomProvider } from "./custom-provider-1";
import { generateText } from "ai";

describe("Custom-Provider", () => {
  it("should subtract two numbers", async () => {
    const provider = createCustomProvider({
      apiKey: "sk-123",
      baseURL: "https://www.ak46.com",
      headers: {
        soul: "inf",
      },
    });

    const model = provider.chat("model-for-u");
    const rs = await generateText({
      model,
      // prompt: "hello",
      messages: [
        { content: "hello?", role: "assistant" },
        { content: "hello2?", role: "assistant" },
        { content: "hello3?", role: "assistant" },
      ],
    });
    const { ...restRs } = rs;
    console.log("rs", restRs);
  });
});
