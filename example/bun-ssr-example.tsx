import { HttpRouter, HttpServer } from "@effect/platform";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun"
import { Layer } from "effect";
import { streamReactNode } from "@/index"; // Uses tsconfig path alias
import React from "react";

// A simple React component
export const App = ({ name }: { name: string }) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Effect React Stream</title>
    </head>
    <body>
      <h1>Hello, {name}!</h1>
      <p>This is streamed from the server using Effect-TS and React.</p>
      {/* Example of a component that might suspend (for demo) */}
      {/* <React.Suspense fallback={<p>Loading user data...</p>}>
        <UserData />
      </React.Suspense> */}
    </body>
  </html>
);

// Example of a component that might suspend (if you use React.Suspense)
// const UserData = React.lazy(async () => {
//   await new Promise(resolve => setTimeout(resolve, 1000));
//   return { default: () => <p>User data loaded!</p> };
// });

// Define the HTTP routes
export const router = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    streamReactNode(
      React.createElement(App, { name: "Effect User" }), // Name for testing
      {
        // Options for react-dom/server.renderToReadableStream
        identifierPrefix: "react-option-example",
      },
      {
        // Optional: custom status and headers for the HTTP response
        status: 200,
        headers: { "x-custom-streaming-header": "active" },
      }
    )
  )
);

// Define the Application with logging
export const app = router.pipe(
  HttpServer.serve(),
  HttpServer.withLogAddress
)

// Create the Server
export const server = Layer.provide(app, BunHttpServer.layer({ port: 3000 }));

// This allows the example to be run directly using `bun run examples/full-server-example.ts`
if (import.meta.main) {
  BunRuntime.runMain(Layer.launch(server));
}
