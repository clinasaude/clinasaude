let lastCapturedError: unknown;

export function captureError(error: unknown) {
  lastCapturedError = error;
}

export function consumeLastCapturedError(): unknown {
  const error = lastCapturedError;
  lastCapturedError = undefined;
  return error;
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => captureError(event.error ?? event.message));
  window.addEventListener("unhandledrejection", (event) => captureError(event.reason));
}
