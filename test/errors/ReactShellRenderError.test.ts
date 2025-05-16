import { expect, test } from "bun:test";
import { ReactShellRenderError } from "../../src/errors/ReactShellRenderError";

test("ReactShellRenderError correctly instancated", () => {
  const streamError = new ReactShellRenderError(new Error("test"));
  expect(streamError._tag).toBe("ReactShellRenderError");
  expect(streamError.underlyingError).toBeInstanceOf(Error);
});