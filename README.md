# react-effect

A package to enable fullstack [React](https://react.dev/) + [Effect](https://effect.website/) applications.

## QuickStart

```bash
bun add @effect/platform effect react react-dom react-effect
bun add --dev @types/react @types/react-dom
```

```typescript
import { HttpRouter, HttpServer, HttpServerResponse } from "@effect/platform";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import * as React from "react";
import { streamReactNode } from "react-effect";

// A simple React component
const App = ({ name }: { name: string }) => (
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

const routes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    Effect.succeed(React.createElement(App, { name: "Effect User" })).pipe(
      Effect.flatMap((reactNode) =>
        streamReactNode(
          reactNode,
          {
            // Options for react-dom/server.renderToReadableStream
            // e.g., bootstrapScripts: ["/main.js"],
            identifierPrefix: "react-option-example",
            // Note: streamReactNode manages its own `onError` for logging.
          },
          {
            // Optional: custom status and headers for the HTTP response
            status: 200,
            headers: { "x-custom-streaming-header": "active" },
          }
        )
      )
    )
  )
);

const AppLive = HttpServer.router.empty.pipe(
  HttpServer.router.add(routes),
  HttpServer.server.serve(),
  Layer.provide(NodeHttpServer.layer({ port: 3000 }))
);

NodeRuntime.runMain(Layer.launch(AppLive)).then(() => {
  console.log("Server started on http://localhost:3000");
});
```

## LICENCE + Contrubutions

This project is MIT Licensed. Any contrubutions should also be MIT Licenced.
