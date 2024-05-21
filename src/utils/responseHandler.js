// utils/responseHandler.js
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  };
  
  const errorResponse = (res, error, message = 'Error', statusCode = 500) => {
    return res.status(statusCode).json({
      status: 'error',
      message,
      error
    });
  };
  
  module.exports = {
    successResponse,
    errorResponse
  };
  