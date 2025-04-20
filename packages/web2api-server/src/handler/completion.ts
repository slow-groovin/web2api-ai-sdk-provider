import { serverInfo } from "@/variables.js";
import { globalClientManager } from "@/ws/client-manage.js";
import { type ModelId } from "@/ws/type.js";
import { consola } from "consola/basic";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import {
  ChatCompletionRequestSchema,
  type ChatCompletionResponse,
  type StreamingResponse,
} from "./completion-types.js";
export const completionAPIHandler = new Hono();

/**
  reasoning will be deserted for now, because ai-sdk has no reasoning stream implemention now, 
  which lead to that the completion api of server cannot not stream reasoning before cmpl part.
*/
completionAPIHandler.post("/chat/completions", async (c) => {
  try {
    const req = await c.req.json();
    const parsedReq = ChatCompletionRequestSchema.parse(req);

    consola.verbose("/chat/completions request param:", parsedReq);
    const {
      model,
      messages,
      stream: useStream = false,
      additional_parameters,
    } = parsedReq;
    if (globalClientManager.state !== 1) {
      return c.json(errorsBuilder.notReady(), 503);
    }
    if (!globalClientManager.includeModel(model)) {
      return c.json(errorsBuilder.modelInvalid(model), 403);
    }
    if (globalClientManager.clientVersion !== serverInfo.version) {
      return c.json(errorsBuilder.versionIncompatible(), 503);
    }

    const {
      stream: chatStream,
      writer,
      id,
    } = globalClientManager.startChat(model, messages, additional_parameters);

    if (useStream) {
      const createdAt = Date.now();
      return streamSSE(c, async (stream) => {
        stream.onAbort(() => {
          consola.log("Aborted!");
          writer.close();
        });

        try {
          for await (const textPart of chatStream) {
            const streamResp: StreamingResponse = {
              id: id,
              object: "chat.completion.chunk",
              created: createdAt,
              model: model,
              choices: [
                {
                  delta: {
                    content: textPart,
                    role: "assistant",
                  },
                  index: 0,
                  finish_reason: null,
                },
              ],
            };
            await stream.writeSSE({
              data: JSON.stringify(streamResp),
            });
          }
          const stopResponse: StreamingResponse = {
            id: id,
            object: "chat.completion.chunk",
            created: createdAt,
            model: model,
            choices: [
              {
                delta: {
                  content: "",
                  role: "assistant",
                },
                index: 0,
                finish_reason: "stop",
              },
            ],
            usage: {
              completion_tokens: 0,
              prompt_tokens: 0,
              total_tokens: 0,
            },
          };
          await stream.writeSSE({
            data: JSON.stringify(stopResponse),
          });
        } catch (e: any) {
          await stream.writeSSE({
            data: e,
          });
        } finally {
          stream.close();
        }
      });
    } else {
      let completeContent = "";
      for await (const k of chatStream) {
        completeContent += k;
      }
      writer.close();
      const response: ChatCompletionResponse = {
        id: id,
        object: "chat.completion",
        created: Date.now(),
        model: model,
        choices: [
          {
            message: {
              role: "assistant",
              content: completeContent,
            },
            logprobs: null,
            finish_reason: "stop",
            index: 0,
          },
        ],
        usage: {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
      };
      return c.json(response);
    }
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json(
        errorsBuilder.requestParam(
          e.message,
          e.errors
            .map((_e) => _e.path)
            .flat()
            .join(",")
        ),
        400
      );
    }
    consola.error("unexpect error:", e);
    return c.json(errorsBuilder.unknownError("unexpect error"), 500);
  }
});

const errorsBuilder = {
  modelInvalid(model: string) {
    return {
      error: {
        // prettier-ignore
        message: `The model \`${model}\` does not exist. support: ${JSON.stringify(globalClientManager.provideModels)}`,
        type: "invalid_request_error",
        param: null,
        code: "model_not_found",
      },
    };
  },
  notReady() {
    return {
      error: {
        message: `The chrome-extention-side of web2api-server is not ready, current state is '${globalClientManager.state}'. Please check it.`,
        type: "server_error",
        param: null,
        code: "service_unavailable",
      },
    };
  },

  requestParam(message: string, param: string) {
    return {
      error: {
        message: message,
        type: "invalid_request_error",
        param: param,
        code: "bad_request",
      },
    };
  },

  versionIncompatible() {
    return {
      error: {
        message: `serverVersion(${serverInfo.version}) is incompatible with clientVersion(${globalClientManager.clientVersion})`,
        type: "invalid_request_error",
        param: null,
        code: "service_unavailable",
      },
    };
  },

  unknownError(message?: string) {
    return {
      error: {
        message: message,
        type: "unknown_error",
        param: null,
        code: "internal_service_error",
      },
    };
  },
};
