// middlewares/errorHandler.js
const { errorResponse } = require('../utils/responseHandler');

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  errorResponse(res, err.message || 'Internal Server Error', 'An unexpected error occurred', 500);
};

module.exports = errorHandler;
