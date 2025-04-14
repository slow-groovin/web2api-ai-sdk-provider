import { beforeAll } from "vitest";

import { APICallError, type LanguageModelV1Prompt } from "@ai-sdk/provider";
import {} from "@ai-sdk/provider-utils/test";
import { moonshotWebProvider } from "./provider.js";
import { KimiWebRequest } from "./request.js";
import { vi, expect, it, describe } from "vitest";
import { sleep } from "radash";

describe("notChromeExtentionEnv", () => {
  it("should throw an env error in node/bun/edge runtime", async () => {
    const throwError = async () => {
      const req = new KimiWebRequest();
      const ready = await req.detectIfReady();
      return ready;
    };
    await expect(throwError).rejects.toThrow(
      "moonshot-web-ai-provider must be called in a browser runtime(such as chrome extension)"
    );
  });
});

describe("stream", () => {
  /**
   * if no token stored, will throw a error to hint login
   */
  it("no token", async () => {
    const request = new KimiWebRequest();

    const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      json: () =>
        Promise.resolve({
          error_type: "auth.token.invalid",
          message: "您的授权已过期，请重新登录",
          detail: "该用户的授权已过期，请重新登录",
        }),
      ok: true,
      status: 401,
    } as Response);

    vi.spyOn(request, "getToken").mockResolvedValueOnce({
      access_token: "",
      refresh_token: "",
    });
    vi.spyOn(request, "createChat").mockImplementation(async () => {
      throw new Error("unreached.");
    });

    try {
      await request.stream([]);
    } catch (error: any) {
      expect(error).toBeInstanceOf(APICallError); // 验证错误类型
      expect(error.message).toBe("moonshot web not login. please login first."); // 验证错误信息
    }
    spy.mockReset();
  });

  it("refresh failed: response 401", async () => {
    const request = new KimiWebRequest();

    //fetch will be called twice
    const spy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: () =>
        Promise.resolve({
          error_type: "auth.token.invalid",
        }),
      ok: true,
      status: 401,
    } as Response);

    //getToken always return this
    vi.spyOn(request, "getToken").mockResolvedValue({
      access_token: "string",
      refresh_token: "string",
    });
    vi.spyOn(request, "createChat").mockImplementation(async () => {
      throw new Error("unreached.");
    });

    try {
      await request.stream([]);
    } catch (error: any) {
      // console.log("error", error);
      expect(error).toBeInstanceOf(APICallError); // 验证错误类型
      expect(error.message).toBe(
        "moonshot web login state expired. please login and retry."
      ); // 验证错误信息
    }
    spy.mockReset();
  });
});

describe("prompt2KimiReq", () => {
  it("should output match expected", () => {
    //@ts-expect-error
    const prompt2KimiReq = KimiWebRequest.prompt2KimiReq;
    const rs = prompt2KimiReq([
      {
        role: "system",
        content: "follow the user's instruction",
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "give a random setence.",
          },
          {
            type: "text",
            text: "it should be no more than 200 words.",
          },
        ],
      },
    ]);
    expect(rs).not.toBeNull();
    expect(rs.messages).toHaveLength(1);
    expect(rs.messages[0].role).toBe("user");
    expect(rs.messages[0].content).toBe(
      "\n" +
        "role:system context:follow the user's instruction\n" +
        "\n" +
        "role:user context:give a random setence.it should be no more than 200 words.\n"
    );
  });
});
