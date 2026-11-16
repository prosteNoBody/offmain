self.onmessage = (event: MessageEvent<number[]>) => {
  self.postMessage(event.data.map((n) => n * 2));
};
