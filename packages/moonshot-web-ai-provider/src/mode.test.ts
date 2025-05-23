import { KimiWebRequest } from "./request.js";
import { vi, describe, it, expect } from "vitest";
import { generateText, streamText } from "ai";
import {
  LanguageModelV1StreamPart,
  LanguageModelV1CallWarning,
  LanguageModelV1Prompt,
} from "@ai-sdk/provider";
import { moonshotWebProvider } from "./provider.js";
import { MoonshotWebModelId } from "./setting.js";

type StreamFunc = KimiWebRequest["stream"];

describe("MoonshotWebLanguageModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("doStream Suc", async () => {
    const stream: StreamFunc = async (opt) => {
      // Mock implementation for stream
      const mockStream = new ReadableStream<LanguageModelV1StreamPart>({
        start(controller) {
          controller.enqueue({
            type: "text-delta",
            textDelta: "Mocked response",
          });
          controller.enqueue({
            type: "finish",
            finishReason: "stop",
            usage: {
              completionTokens: 0,
              promptTokens: 0,
            },
          });

          controller.close();
        },
      });

      return {
        stream: mockStream,
        rawCall: { rawPrompt: {}, rawSettings: { logLevel: 1 } },
        rawResponse: { headers: { "Content-Type": "application/json" } },
        request: { body: JSON.stringify({}) },
        warnings: [],
      };
    };
    KimiWebRequest.prototype.stream = vi.fn().mockImplementation(stream);

    const callback = vi.fn();
    expect(callback).not.toBeCalled();
    const { textStream } = streamText({
      model: moonshotWebProvider.chatModel("kimi"),
      prompt: "-- some setences.",
      onError(e) {
        expect(e).toBeNull();
        callback();
      },
    });
    let result = "";
    for await (const part of textStream) {
      result += part;
    }
    expect(result).toBe("Mocked response");

    const { text } = await generateText({
      model: moonshotWebProvider("kimi"),
      prompt: "-- some setences.",
    });

    expect(text).toBe("Mocked response");
  });

  it("doStream stream error", async () => {
    const stream: StreamFunc = async (opt) => {
      // Mock implementation for stream
      const mockStream = new ReadableStream<LanguageModelV1StreamPart>({
        start(controller) {
          controller.enqueue({
            type: "text-delta",
            textDelta: "Mocked response",
          });
          controller.enqueue({
            type: "finish",
            finishReason: "stop",
            usage: {
              completionTokens: 0,
              promptTokens: 0,
            },
          });
          controller.enqueue({
            type: "error",
            error: "error content",
          });

          controller.close();
        },
      });

      return {
        stream: mockStream,
        rawCall: { rawPrompt: {}, rawSettings: { logLevel: 1 } },
        rawResponse: { headers: { "Content-Type": "application/json" } },
        request: { body: JSON.stringify({}) },
        warnings: [],
      };
    };
    KimiWebRequest.prototype.stream = vi.fn().mockImplementation(stream);

    const callback = vi.fn();
    expect(callback).not.toBeCalled();
    const { textStream } = streamText({
      model: moonshotWebProvider("kimi"),
      prompt: "-- some setences.",
      onError(e) {
        expect(e).toEqual({
          error: "error content",
        });
        callback();
      },
    });
    let result = "";
    for await (const part of textStream) {
      result += part;
    }

    try {
      const {} = await generateText({
        model: moonshotWebProvider("kimi"),
        prompt: "-- some setences.",
      });
    } catch (e) {
      expect(e).toEqual("error content");
    }
  });

  it("doStream directly error", async () => {
    const stream: StreamFunc = async (opt) => {
      throw "error content";
    };
    KimiWebRequest.prototype.stream = vi.fn().mockImplementation(stream);

    const callback = vi.fn();
    expect(callback).not.toBeCalled();
    const { textStream } = streamText({
      model: moonshotWebProvider("kimi"),
      prompt: "-- some setences.",
      onError(e) {
        expect(e).toEqual({
          error: "error content",
        });
        callback();
      },
    });
    for await (const part of textStream) {
    }

    try {
      const {} = await generateText({
        model: moonshotWebProvider("kimi"),
        prompt: "-- some setences.",
      });
    } catch (e) {
      expect(e).toEqual("error content");
    }
  });

  it("doStream reason Suc", async () => {
    const stream: StreamFunc = async (opt) => {
      // Mock implementation for stream
      const mockStream = new ReadableStream<LanguageModelV1StreamPart>({
        start(controller) {
          controller.enqueue({
            type: "reasoning",
            textDelta: "reason text 1",
          });
          controller.enqueue({
            type: "text-delta",
            textDelta: "Mocked response",
          });
          controller.enqueue({
            type: "finish",
            finishReason: "stop",
            usage: {
              completionTokens: 0,
              promptTokens: 0,
            },
          });

          controller.close();
        },
      });

      return {
        stream: mockStream,
        rawCall: { rawPrompt: {}, rawSettings: { logLevel: 1 } },
        rawResponse: { headers: { "Content-Type": "application/json" } },
        request: { body: JSON.stringify({}) },
        warnings: [],
      };
    };
    KimiWebRequest.prototype.stream = vi.fn().mockImplementation(stream);

    const callback = vi.fn();
    expect(callback).not.toBeCalled();
    const { textStream, reasoning, reasoningDetails, finishReason } =
      streamText({
        model: moonshotWebProvider.chatModel("k1", { use_search: true }),
        prompt: "-- some setences.",
        onError(e) {
          expect(e).toBeNull();
          callback();
        },
      });
    let result = "";
    for await (const part of textStream) {
      result += part;
    }
    let reasoningText = await reasoning;
    expect(reasoningText).toBe("reason text 1");

    expect(await finishReason).toBe("stop");

    expect(result).toBe("Mocked response");
    const {
      text,
      reasoning: reasoning2,
      finishReason: finishReason2,
    } = await generateText({
      model: moonshotWebProvider("kimi"),
      prompt: "-- some setences.",
    });

    expect(text).toBe("Mocked response");
    expect(reasoning2).toBe("reason text 1");
    expect(finishReason2).toBe("stop");
  });
});
