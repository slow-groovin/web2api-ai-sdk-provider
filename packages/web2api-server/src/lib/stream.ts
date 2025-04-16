import { consola } from "consola/basic";

export function createManagedStream() {
  let streamController: ReadableStreamDefaultController<any> | undefined; // Declare variable in outer scope to capture controller

  const stream = new ReadableStream({
    start(controller) {
      // Capture controller when stream is constructed
      streamController = controller;
      consola.verbose("Stream started.");
    },

    cancel(reason) {
      // Optional: Called when consumer cancels the stream.
      // console.log(`Stream cancelled. Reason: ${reason}`)
      streamController = undefined; // Clean up reference
    },
  });

  // Encapsulate control logic to avoid directly exposing the controller
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
        consola.verbose("Writer: Closing the stream.");
        streamController.close();
        streamController = undefined;
      } catch (error) {
        consola.error("Writer: Error closing stream:", error);
      }
    },

    /**
     * try to close the stream, ignore the error
     * @returns
     */
    tryClose: () => {
      if (!streamController) {
        return;
      }
      try {
        streamController.close();
        streamController = undefined;
      } catch (error) {}
    },
    error: (err: any) => {
      if (!streamController) {
        consola.warn(
          "Writer: Stream controller not available or stream closed/errored."
        );
        return;
      }
      try {
        // Make the stream error
        consola.debug("Writer: Erroring the stream:", err);
        streamController.error(err);
        streamController = undefined; // Clean up reference
      } catch (error) {
        consola.error("Writer: Error while trying to error the stream:", error);
      }
    },
  };

  return { stream, writer };
}
