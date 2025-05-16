import { HttpServerResponse } from "@effect/platform";
import { Effect, Stream } from "effect";
import type { ReactNode } from "react";
import {
  renderToReadableStream,
  type RenderToReadableStreamOptions,
} from "react-dom/server";

/**
 * Error type for failures occurring during the initial shell rendering phase
 * of the React stream (i.e., when `renderToReadableStream` promise rejects).
 */
export class ReactShellRenderError {
  readonly _tag = "ReactShellRenderError";
  constructor(readonly underlyingError: unknown) {}
}

/**
 * Error type for failures occurring within the async iterable stream
 * after the initial React shell has been successfully rendered and sent.
 * These errors are typically caught from the ReadableStream's async iterator.
 */
export class ReactAsyncIterableStreamError {
  readonly _tag = "ReactAsyncIterableStreamError";
  constructor(readonly underlyingError: unknown) {}
}

/**
 * Configuration options for the HTTP response when streaming a ReactNode.
 */
export interface StreamResponseConfig {
  /**
   * HTTP status code for a successful stream.
   * @default 200
   */
  status?: number;
  /**
   * HTTP headers for a successful stream. These will be merged with (and can override)
   * the default `{"content-type": "text/html"}` header.
   */
  headers?: HttpServerResponse.HttpServerResponse.Input["headers"];
}

/**
 * Streams a ReactNode to an HttpServerResponse, suitable for React Server Components (RSC)
 * or general server-side rendering with streaming.
 *
 * This function converts React's `renderToReadableStream` into an Effect-native stream
 * and handles errors by returning appropriate HTTP error responses.
 *
 * @param node The ReactNode to render and stream.
 * @param renderOptions Configuration options for `react-dom/server.renderToReadableStream`.
 *                      Note: The `onError` callback within these options will be internally
 *                      managed by this function to integrate with Effect's logging.
 *                      Any `onError` you provide will be overridden.
 * @param streamConfig Optional configuration for the HTTP response itself (e.g., status, headers).
 * @returns An Effect that resolves to an HttpServerResponse. This effect itself does not fail;
 *          all errors are caught and translated into HTTP error responses.
 */
export function streamReactNode(
  node: ReactNode,
  renderOptions: RenderToReadableStreamOptions,
  streamConfig: StreamResponseConfig = {}
): Effect.Effect<HttpServerResponse.HttpServerResponse, never, never> {
  return Effect.tryPromise({
    try: () =>
      renderToReadableStream(node, {
        ...renderOptions,
        // React's onError callback for errors during streaming (after shell).
        // We log these errors. React will typically abort the stream.
        onError: (error) => {
          // This runs synchronously as it's a callback from React.
          // It's crucial for logging errors that occur *during* the stream
          // after the initial promise has resolved.
          Effect.runSync(
            Effect.logError(
              "React stream error (reported via React's onError callback after shell was sent)",
              error
            )
          );
        },
      }),
    // This catch handles errors from the renderToReadableStream promise itself (e.g., shell rendering failure).
    catch: (error: unknown) => new ReactShellRenderError(error),
  }).pipe(
    Effect.flatMap((reactWebStream) => {
      // Shell rendering was successful. reactWebStream is a ReadableStream<Uint8Array>.
      // Convert the Web API ReadableStream to an Effect Stream using its async iterator.
      const effectStream = Stream.fromAsyncIterable(
        reactWebStream.values() satisfies AsyncIterable<Uint8Array>,
        (errorFromAsyncIterable: unknown) =>
          new ReactAsyncIterableStreamError(errorFromAsyncIterable)
      ).pipe(
        // This tapErrorCause logs errors from the Effect stream itself.
        // These are errors that might occur while iterating the async iterable
        // (e.g., if a component deeper in the tree throws asynchronously).
        Stream.tapErrorCause((cause) =>
          Effect.logWarning(
            "Effect stream (derived from React) encountered an error after the shell was sent.",
            cause
          )
        )
      );

      const { status = 200, headers = {} } = streamConfig;
      // Ensure 'content-type' is set, but allow user to override it via streamConfig.headers
      const responseHeaders = { "content-type": "text/html", ...headers };

      return Effect.succeed(
        HttpServerResponse.stream(effectStream, {
          status,
          headers: responseHeaders,
        })
      );
    }),
    Effect.catchTags({
      // Handle failure to render the initial shell.
      ReactShellRenderError: (error) =>
        Effect.logError(
          "React SSR shell rendering failed. Sending 500 response.",
          error.underlyingError
        ).pipe(
          Effect.andThen(
            HttpServerResponse.text("Server Shell Error", {
              status: 500,
              headers: { "content-type": "text/html" },
            })
          )
        ),
    }),
    // This catchAll is a safety net for any other unexpected synchronous errors
    // during the Effect pipeline setup before returning the streaming response.
    // For example, if `reactWebStream.values()` was misconfigured or unavailable and threw.
    Effect.catchAll((unexpectedError) =>
      Effect.logError(
        "Unexpected error during React SSR stream setup. Sending 500 response.",
        unexpectedError
      ).pipe(
        Effect.andThen(
          HttpServerResponse.text("Internal Server Error", {
            status: 500,
            headers: { "content-type": "text/html" },
          })
        )
      )
    )
  );
}
