import { expect, test, mock, beforeEach, describe, spyOn } from "bun:test";
import { Effect } from "effect";
import { streamReactNode } from "@/streamReactNode";
import ReactDOMServer from "react-dom/server";

describe("streamReactNode", () => {
  const TestComponent = () => <div>Hello World</div>;
  let renderToReadableStreamSpy: ReturnType<typeof mock>;

  beforeEach(() => {
    mock.restore();
    renderToReadableStreamSpy = mock(
      async (...args: Parameters<typeof ReactDOMServer.renderToReadableStream>) => {
        // Call the original function
        return ReactDOMServer.renderToReadableStream(...args);
      },
    );
    mock.module("react-dom/server", () => ({
      renderToReadableStream: renderToReadableStreamSpy,
    }));
  });

  test("streamReactNode converts React node to a streamable HttpServerResponse", async () => {
    const response = await Effect.runPromise(
      streamReactNode(<TestComponent />, {}, {})
    );
    
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toBe("text/html");
    expect(renderToReadableStreamSpy).toHaveBeenCalledTimes(1);
    expect(renderToReadableStreamSpy).toHaveBeenCalledWith(<TestComponent />, expect.any(Object));
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
    
    expect(renderToReadableStreamSpy).toHaveBeenCalledTimes(1);
    expect(renderToReadableStreamSpy).toHaveBeenCalledWith(
      <TestComponent />,
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
});
