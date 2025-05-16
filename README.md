# react-effect

A package to enable fullstack [React](https://react.dev/) + [Effect](https://effect.website/) applications.

## QuickStart

```bash
bun add @effect/platform effect react react-dom react-effect
bun add --dev @types/react @types/react-dom
```

```typescript
import { HttpRouter } from "@effect/platform";
import { streamReactNode } from "react-effect";

// A simple React component for server rendering
// Ensure it renders a full HTML structure if it's the root.
function PageComponent(props: { title: string; message: string }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{props.title}</title>
        {/* <link rel="stylesheet" href="/styles.css"></link> */}
      </head>
      <body>
        <h1>{props.message}</h1>
        <div id="root"></div> {/* For client-side hydration target */}
        {/* note: Bootstrap scripts can be added via options */}
      </body>
    </html>
  );
}

export const reactRoutes = HttpRouter.empty.pipe(
  HttpRouter.get(
    "/",
    streamReactNode(<PageComponent title="Home Page" message="Hello from React and Effect!" />, {})
  ),
  HttpRouter.get(
    "/another",
    streamReactNode(
      <PageComponent title="Another Page" message="This is another streamed page!" />,
      {
        identifierPrefix: "react-option-example",
      }
    )
  )
);
```

## LICENCE + Contrubutions

This project is MIT Licensed. Any contrubutions should also be MIT Licenced.
