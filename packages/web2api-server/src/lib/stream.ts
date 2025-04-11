export function createManagedStream() {
  let streamController: ReadableStreamDefaultController<any> | undefined; // 在外部作用域声明变量以捕获 controller

  const stream = new ReadableStream({
    start(controller) {
      // 当流被构造时，捕获 controller
      streamController = controller;
      // console.log('Stream started, controller captured.')
    },

    cancel(reason) {
      // 可选：当消费者取消流时调用。
      // console.log(`Stream cancelled. Reason: ${reason}`)
      // 在这里可以进行清理工作
      streamController = undefined; // 清理引用
    },
  });

  // 封装控制逻辑，避免直接暴露 controller
  const writer = {
    write: (chunk: any) => {
      if (!streamController) {
        console.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        // 将数据块排入队列
        // console.log('Writer: Enqueuing chunk:', chunk, typeof chunk)
        streamController.enqueue(chunk);
      } catch (error) {
        console.error("Writer: Error enqueuing data:", error);
        // 可以在这里决定是否通过 controller.error() 使流出错
      }
    },
    close: () => {
      if (!streamController) {
        console.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        // 关闭流
        console.log("Writer: Closing the stream.");
        streamController.close();
        streamController = undefined; // 清理引用
      } catch (error) {
        console.error("Writer: Error closing stream:", error);
      }
    },
    error: (err: any) => {
      if (!streamController) {
        console.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        // 使流出错
        console.error("Writer: Erroring the stream:", err);
        streamController.error(err);
        streamController = undefined; // 清理引用
      } catch (error) {
        console.error("Writer: Error while trying to error the stream:", error);
      }
    },
  };

  return { stream, writer };
}
