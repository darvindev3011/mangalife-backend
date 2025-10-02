export function sendResponse(res, { status = 200, message = '', data = null, error = null }) {
  res.status(status).json({
    success: !error,
    message,
    data,
    error: error ? (typeof error === 'object' ? { message: error.message || String(error) } : { message: String(error) }) : undefined,
  });
}
