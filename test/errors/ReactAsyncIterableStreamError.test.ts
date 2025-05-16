import { expect, test } from "bun:test";
import { ReactAsyncIterableStreamError } from "../../src/errors/ReactAsyncIterableStreamError";

test("ReactAsyncIterableStreamError correctly instancated", () => {
  const streamError = new ReactAsyncIterableStreamError(new Error("test"));
  expect(streamError._tag).toBe("ReactAsyncIterableStreamError");
  expect(streamError.underlyingError).toBeInstanceOf(Error);
});