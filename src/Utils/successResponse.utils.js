


export const successResponse = ({
  res,
  statusCode = 200,
  message = "Done",
  data
}) => {

  const response = {
    success: true,
    message,
  };

  if (data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};


export const errorResponse = ({ res, statusCode = 500, message = "error" }) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};