import { expect, test, mock } from "bun:test";
import { Effect } from "effect";
import { streamReactNode } from "@/streamReactNode";

// Mock react-dom/server
const mockReadableStream = {
  values: () => ({
    [Symbol.asyncIterator]: async function* () {
      yield new TextEncoder().encode("<html>");
      yield new TextEncoder().encode("<body>");
      yield new TextEncoder().encode("</body></html>");
    },
  }),
};
mock.module("react-dom/server", () => ({
  renderToReadableStream: mock(async () => mockReadableStream),
}));

// Import after mocking
const { renderToReadableStream } = await import("react-dom/server");

// Global Variables
const TestComponent = () => <div>Hello World</div>;

test("streamReactNode converts React node to a streamable HttpServerResponse", async () => {
  const response = await Effect.runPromise(
    streamReactNode(<TestComponent />, {}, {})
  );
  
  expect(response.status).toBe(200);
  expect(response.headers["content-type"]).toBe("text/html");
  expect(renderToReadableStream).toHaveBeenCalledTimes(1);
  expect(renderToReadableStream).toHaveBeenCalledWith(<TestComponent />, expect.any(Object));
});

test("streamReactNode uses custom HttpServerResponse.Options", async () => {
  const response = await Effect.runPromise(
    streamReactNode(
      <TestComponent />,
      {},
      { 
        status: 201,
        headers: { 
          "x-custom-header": "custom-value",
          "content-type": "text/plain"
        }
      }
    )
  );
  
  expect(response.status).toBe(201);
  expect(response.headers["x-custom-header"]).toBe("custom-value");
  expect(response.headers["content-type"]).toBe("text/plain");
});

test("streamReactNode passes RenderToReadableStreamOptions to renderToReadableStream", async () => {
  await Effect.runPromise(
    streamReactNode(
      <TestComponent />,
      {
        bootstrapScripts: ["/main.js"],
        identifierPrefix: "react-option-example",
      }
    )
  );
  
  expect(renderToReadableStream).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      bootstrapScripts: ["/main.js"],
      identifierPrefix: "react-option-example",
    })
  );
});

test.todo("streamReactNode handles ReactShellRenderError", async () => {
  // todo
});

test.todo("streamReactNode handles ReactAsyncIterableStreamError", async () => {
  // todo
});

test.todo("streamReactNode React onError render option logs to Effect", async () => {
  // todo
});
