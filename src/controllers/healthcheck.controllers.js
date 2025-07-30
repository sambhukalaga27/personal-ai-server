import { SuccessResponse } from '../utils/SuccessResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const healthcheck = asyncHandler( async (req, res, next) => {
  console.info('healthcheck: started');

  const data = {
    status: 'OK',
    timestamp: new Date()?.toISOString(),
    uptime: process?.uptime(),
    memoryUsage: process?.memoryUsage(),
    RequestMethod: req?.method,
    RequestURL: req?.originalUrl,
    RequestHeaders: req?.headers,
    UserIP: req?.ip,
    nodeVersion: process?.version,
    platform: process?.platform,
    arch: process?.arch,
  }

  console.info('healthcheck: executed successfully');
  return res
    .status(200)
    .json(new SuccessResponse(200, data, 'Health Check Passed'));
});

export { healthcheck }
