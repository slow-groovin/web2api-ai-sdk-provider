import {} from "@ai-sdk/provider-utils/test";
import { describe, expect, it, vi } from "vitest";
import { CriticalValueMissError, ResponseStatusError } from "./errors.js";
import { generateProofToken } from "./pow.js";
import {
  buildConversationInput,
  ChatgptWebRequest,
  isThinkingModel,
} from "./request.js";
import { ChatgptRequestOption } from "./types.js";
import { TOKEN_DURATION } from "./variables.js";

describe("critical errors", () => {
  it("should throw an env error if not set option", async () => {
    const throwError = async () => {
      new ChatgptWebRequest({} as ChatgptRequestOption);
    };
    await expect(throwError).rejects.toThrow(CriticalValueMissError);
  });

  it("fetch requirements failed", async () => {
    const request = new ChatgptWebRequest({
      accessToken: { value: "123", savedAt: Date.now() },
      accessTokenSetter: (v) => {},
      oai: {
        oaiDeviceId: "123",
        oaiLanguage: "123",
      },
    });

    const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () => Promise.resolve("suspective request"),
      text: () => Promise.resolve("suspective request"),

      ok: true,
      status: 403,
    } as Response);

    try {
      await request.conversation({ model: "auto", prompt: [] });
    } catch (error: any) {
      expect(error).toBeInstanceOf(ResponseStatusError); // 验证错误类型
    }

    spy.mockReset();
  });
});

it("convertPrompt", () => {
  const option: Parameters<typeof buildConversationInput>[0] = {
    model: "gpt5.0",
    prompt: [
      {
        role: "system",
        content: "follow the instruction.",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "who are you?",
          },
          {
            type: "text",
            text: "I'm Jack.",
          },
        ],
      },
    ],
  };
  const rs = buildConversationInput(option);
  expect(rs.messages[0].content.parts[0]).eq(
    `[system]follow the instruction.\n[user]who are you?I'm Jack.`
  );
  expect(rs.force_use_search).toBeUndefined();

  option.model = "o4-mini";
  expect(buildConversationInput(option).suggestions).toEqual(["reason"]);

  option.use_search = true;
  expect(buildConversationInput(option).force_use_search).toBeTruthy();
});

it("isThinkingModel", () => {
  expect(isThinkingModel("o4-mini")).toBeTruthy();
  expect(isThinkingModel("o3-mini")).toBeTruthy();
  expect(isThinkingModel("gpt-5o")).toBeFalsy();
  expect(isThinkingModel("o6")).toBeTruthy();
});

it("getToken", async () => {
  const mockSetter = vi.fn();
  const request = new ChatgptWebRequest({
    accessToken: { value: "123", savedAt: Date.now() - TOKEN_DURATION - 1 },
    accessTokenSetter: mockSetter,
    oai: {
      oaiDeviceId: "123",
      oaiLanguage: "123",
    },
  });

  const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
    json: () =>
      Promise.resolve({
        accessToken: "new-123",
      }),
    ok: true,
    status: 200,
  } as Response);
  const result = await request.getTokenValue();
  expect(result).toBe("new-123");
  expect(mockSetter).toHaveBeenCalledTimes(1);
  expect(mockSetter).toHaveBeenCalledWith("new-123");
  expect(spy).toHaveBeenCalledOnce();

  spy.mockReset();
});

it("getHeaders", async () => {
  const request = new ChatgptWebRequest({
    accessToken: { value: "123", savedAt: Date.now() },
    accessTokenSetter: () => {},
    oai: {
      oaiDeviceId: "123",
      oaiLanguage: "123",
    },
  });
  const headers = await request["getHeaders"]();
  expect(headers).toEqual({
    Authorization: "Bearer 123",
    "Content-Type": "application/json",
    "Oai-Device-Id": "123",
    "Oai-Language": "123",
    "sec-fetch-site": "same-origin",
  });
});

describe("generateProofOfToken", async () => {
  it("shoudl work ok", () => {
    const pow = generateProofToken("0.9185865261456152", "0025a8");
    expect(pow.slice(0, 8)).toBe("gAAAAABW");
  });
});
