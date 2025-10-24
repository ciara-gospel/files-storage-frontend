export const getDefaultFetchOptions = (method: string = 'GET'): RequestInit => ({
  method,
  headers: {
    'Content-Type': 'application/json',
    'X-Amz-Date': new Date().toUTCString(),
  },
  mode: 'cors',
  // For cross-origin calls to API Gateway we don't want the browser to send cookies/credentials
  // which would force the server to return Access-Control-Allow-Credentials: true.
  // Use 'omit' to avoid credential-related CORS preflight failures in dev.
  credentials: 'omit'
});