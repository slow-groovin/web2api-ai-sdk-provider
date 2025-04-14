import { consola } from "consola/basic";

export function createManagedStream() {
  let streamController: ReadableStreamDefaultController<any> | undefined; // 在外部作用域声明变量以捕获 controller

  const stream = new ReadableStream({
    start(controller) {
      // 当流被构造时，捕获 controller
      streamController = controller;
      consola.verbose("Stream started.");
    },

    cancel(reason) {
      // 可选：当消费者取消流时调用。
      // console.log(`Stream cancelled. Reason: ${reason}`)
      streamController = undefined; // 清理引用
    },
  });

  // 封装控制逻辑，避免直接暴露 controller
  const writer = {
    write: (chunk: any) => {
      if (!streamController) {
        consola.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        consola.verbose("Writer: Enqueuing chunk:", chunk, typeof chunk);
        streamController.enqueue(chunk);
      } catch (error) {
        consola.error("Writer: Error enqueuing data:", error);
      }
    },
    close: () => {
      if (!streamController) {
        consola.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        // 关闭流
        consola.verbose("Writer: Closing the stream.");
        streamController.close();
        streamController = undefined; // 清理引用
      } catch (error) {
        consola.error("Writer: Error closing stream:", error);
      }
    },
    error: (err: any) => {
      if (!streamController) {
        consola.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        // 使流出错
        consola.debug("Writer: Erroring the stream:", err);
        streamController.error(err);
        streamController = undefined; // 清理引用
      } catch (error) {
        consola.error("Writer: Error while trying to error the stream:", error);
      }
    },
  };

  return { stream, writer };
}
