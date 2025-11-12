export function getErrorMessageByStatus(status: number): string {
  switch (status) {
    case 400:
      return "Invalid request. Please check your search parameters.";
    case 401:
    case 403:
      return "Authentication failed. Please log in again.";
    case 404:
      return "Resource not found. Please try a different search.";
    case 413:
      return "Request too large. Please try a smaller search.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "Server error. Please try again later.";
    default:
      return "Failed to complete search. Please try again.";
  }
}
