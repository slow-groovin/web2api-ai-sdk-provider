import { createManagedStream } from "@/lib/stream.js";
import { globalClientManager } from "@/ws/client-manage.js";
import { Hono } from "hono";
import { stream, streamText, streamSSE } from "hono/streaming";
import {
  ChatCompletionRequestSchema,
  type ChatCompletionResponse,
  type StreamingResponse,
} from "./completion-types.js";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { providerTypeEnum, type ProviderType } from "@/ws/type.js";

export const apiApp = new Hono();

apiApp.post("/chat/completions", async (c) => {
  try {
    const req = await c.req.json();
    const parsedReq = ChatCompletionRequestSchema.parse(req);

    const { model, messages, stream: useStream = false } = parsedReq;
    if (globalClientManager.state !== 1) {
      return c.json(errorsBuilder.notReady(), 503);
    }
    if (!globalClientManager.providers.includes(model as ProviderType)) {
      return c.json(errorsBuilder.modelInvalid(model), 403);
    }

    const {
      stream: chatStream,
      writer,
      id,
    } = globalClientManager.startChat(messages);

    if (useStream) {
      const createdAt = Date.now();
      return streamSSE(c, async (stream) => {
        stream.onAbort(() => {
          console.log("Aborted!");
          writer.close();
        });

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
        stream.close();
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
    console.error(e);
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
    throw new HTTPException(500, { message: `unexpected error:${e}` });
  }
});

const errorsBuilder = {
  modelInvalid(model: string) {
    return {
      error: {
        // prettier-ignore
        message: `The model \`${model}\` does not exist. support: ${globalClientManager.providers}`,
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
};
