/**
 * Error type for failures occurring within the async iterable stream
 * after the initial React shell has been successfully rendered and sent.
 * These errors are typically caught from the ReadableStream's async iterator.
 */
export class ReactAsyncIterableStreamError {
  readonly _tag = "ReactAsyncIterableStreamError";
  constructor(readonly underlyingError: unknown) {}
}