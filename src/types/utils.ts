/**
 * Options object for the handleApiError function.
 * Contains the response object, optional parsed data, and optional location identifier.
 */
export interface HandleApiErrorOptions {
  response: Response;
  data?: any;
  location?: string;
}