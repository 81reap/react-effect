/**
 * Error type for failures occurring during the initial shell rendering phase
 * of the React stream (i.e., when `renderToReadableStream` promise rejects).
 */
export class ReactShellRenderError {
  readonly _tag = "ReactShellRenderError";
  constructor(readonly underlyingError: unknown) {}
}