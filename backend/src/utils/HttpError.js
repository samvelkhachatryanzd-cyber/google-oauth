// An error whose message is safe to show to the client.
// `status` is the HTTP status code; 4xx messages are exposed, 5xx ones never are.
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.expose = status < 500;
  }
}

module.exports = HttpError;
