import { expect, test } from "vitest";

test("a worker answers a message", async () => {
  const worker = new Worker(new URL("./echo.worker.ts", import.meta.url), {
    type: "module",
  });
  const reply = new Promise<number[]>((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<number[]>) => resolve(event.data);
    worker.onerror = reject;
  });

  worker.postMessage([1, 2, 3]);

  expect(await reply).toEqual([2, 4, 6]);
  worker.terminate();
});
