import { createManagedStream } from "./stream.js";
import { describe, expect, it } from "vitest";

describe("createManagedStream", () => {
  it("should create a stream and writer that can be used to write data to the stream", async () => {
    const { stream, writer } = createManagedStream();
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let result = "";

    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          result += decoder.decode(value, { stream: true });
        }
      } catch (e) {
        console.error(e);
      }
    })();

    const data = ["chunk1", "chunk2", "chunk3"];
    for (const chunk of data) {
      writer.write(new TextEncoder().encode(chunk));
    }
    writer.close();

    // 等待一段时间，确保所有数据都被写入和读取
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(result).toBe("chunk1chunk2chunk3");
  });

  it("should handle stream errors correctly", async () => {
    const { stream, writer } = createManagedStream();
    const reader = stream.getReader();

    let errorResult: any;

    (async () => {
      try {
        while (true) {
          await reader.read();
        }
      } catch (e) {
        errorResult = e;
      }
    })();

    const errorMessage = "Something went wrong";
    writer.error(errorMessage);

    // 等待一段时间，确保错误被抛出
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(errorResult).toBe(errorMessage);
  });
});
