import { describe, expect, test } from "bun:test";
import { ReactAsyncIterableStreamError } from "@/errors/ReactAsyncIterableStreamError";
import { ReactShellRenderError } from "@/errors/ReactShellRenderError";

describe("Errors", () => {
  test("ReactShellRenderError correctly instancated", () => {
    const streamError = new ReactShellRenderError(new Error("test"));
    expect(streamError._tag).toBe("ReactShellRenderError");
    expect(streamError.underlyingError).toBeInstanceOf(Error);
  });

  test("ReactAsyncIterableStreamError correctly instancated", () => {
    const streamError = new ReactAsyncIterableStreamError(new Error("test"));
    expect(streamError._tag).toBe("ReactAsyncIterableStreamError");
    expect(streamError.underlyingError).toBeInstanceOf(Error);
  });
});