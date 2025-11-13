import { AppError } from "../middleware/errorHandler.js";

export async function retry(fn, options = {}) {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry } = options;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries || !isRetryable(error)) {
        throw new AppError(
          `Max retries achieved ${error}`,
          500,
          "MAX_RETRIES_ERROR"
        );
      }

      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * Math.pow(backoff, attempt))
      );
    }
  }

  throw new AppError(`${lastError}`, 500, "RETRY_ERROR");
}

function isRetryable(error) {
  if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
    return true;
  }

  if (error.response?.status) {
    const status = error.response.status;
    return status === 429 || status >= 500 || status === 408;
  }

  return false;
}
