const HttpError = require('../utils/HttpError');

// Friendlier text for errors thrown by express.json() before a request reaches a controller.
const BODY_PARSER_MESSAGES = {
  'entity.parse.failed': 'Malformed JSON body',
  'entity.too.large': 'Request body too large',
};

function notFound(req, res, next) {
  next(new HttpError(404, 'Not found'));
}

// Express recognises error middleware by its four arguments, so `next` must stay in the signature.
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  // Client errors (HttpError, body-parser errors) are safe to describe to the client.
  if (Number.isInteger(err.status) && err.status >= 400 && err.status < 500 && err.expose) {
    return res.status(err.status).json({ error: BODY_PARSER_MESSAGES[err.type] ?? err.message });
  }

  // Anything else is a bug or an outage: log it, but never leak details to the client.
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFound, errorHandler };
