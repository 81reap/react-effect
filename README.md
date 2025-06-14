# react-effect

A wip package to enable fullstack [React](https://react.dev/) + [Effect](https://effect.website/) applications.

## QuickStart

```bash
bun init
bun add effect react react-dom react-effect
bun add @effect/platform @effect/platform-bun 
bun add --dev @types/react @types/react-dom
```

Then checkout the [Bun SSR Example](/example/bun-ssr-example.tsx). This also works with Node and Deno runtimes. Just replace [@effect/platform-bun](https://www.npmjs.com/package/@effect/platform-bun) with [@effect/platform-node](https://www.npmjs.com/package/@effect/platform-node).

```typescript
// rest of the example is the same

export const server = Layer.provide(app, NodeHttpServer.layer({ port: 3000 }));

if (import.meta.main) {
  NodeRuntime.runMain(Layer.launch(server));
}
```

## LICENCE + Contrubutions

This project is MIT Licensed. Any contrubutions should also be MIT Licenced.
