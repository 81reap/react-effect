import { Effect, Layer, Fiber, Schedule } from "effect";
import { describe, expect, test } from "bun:test";
import { server as AppServerLayer } from "@example/bun-ssr-example";

describe("bun-ssr-example", () => {
  const PORT = 3000; // Must match the port in bun-ssr-exampl.tsx

  test(
    "Bun SSR example from example/bun-ssr-example.tsx runs and serves HTML correctly",
    async () => {
      const testEffect = Effect.gen(function* (_) {
        // Launch the AppServerLayer (which includes the BunHttpServer) in a scoped Fiber.
        // The server will run until this fiber is interrupted.
        const serverFiber = yield* _(
          Layer.launch(AppServerLayer), // Use the imported server Layer
          Effect.forkScoped
        );

        // Helper to fetch with retry, ensuring server is up
        const fetchWithRetry = (path: string) =>
          Effect.retry(
            Effect.tryPromise(async () => {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout per attempt
              try {
                const response = await fetch(`http://localhost:${PORT}${path}`, {
                  signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (response.status !== 200) {
                  throw new Error(
                    `Fetch failed with status ${response.status}`
                  );
                }
                return response;
              } catch (error) {
                clearTimeout(timeoutId);
                throw error;
              }
            }),
            Schedule.spaced("300 millis")
          );

        // Make a request to the server's root path
        const response = yield* _(fetchWithRetry("/"));
        const text = yield* _(Effect.tryPromise(() => response.text()));

        // Assertions based on your example/bun-ssr-exampl.tsx
        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toContain("text/html");
        expect(response.headers.get("x-custom-streaming-header")).toBe(
          "active"
        );
        expect(text).toContain("<h1>Hello, <!-- -->Effect User<!-- -->!</h1>"); // Name from example
        expect(text).toContain(
          "<p>This is streamed from the server using Effect-TS and React.</p>"
        );
        expect(text).toContain("<title>Effect React Stream</title>");

        // Interrupt the server fiber to stop the server and clean up resources
        yield* _(Fiber.interrupt(serverFiber));
      });

      // Run the test Effect. BunRuntime context is implicitly handled by Bun's environment
      // and the BunHttpServer.layer.
      await Effect.runPromise(Effect.scoped(testEffect));
    },
    20000
  ); // Test timeout: 20 seconds
});