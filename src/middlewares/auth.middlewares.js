import { ErrorResponse } from '../utils/ErrorResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, _, next) => {
  console.info('verifyJWT: Started.');

  try {
    // Checking if the token is present in cookies for PC or in the authorization header for Mobile
    const authHeader = req.headers?.authorization || req.header('Authorization');
    const token = req.cookies?.accessToken || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (req.cookies?.accessToken) {
      console.info('verifyJWT: Cookie accessToken found.');
    } else if (token) {
      console.info('verifyJWT: Header accessToken found.');
    }

    if (!token) {
      console.error('verifyJWT: No accessToken found.');
      throw new ErrorResponse(401, 'Unauthorized request');
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select('-password -refreshToken -__v');

    if (!user) {
      console.error('verifyJWT: Invalid accessToken.');
      throw new ErrorResponse(401, 'Invalid Access Token');
    }

    // Adding user to request object which can be used by controllers which uses this middleware
    req.user = user;
    console.info('User authenticated:', user?.userName);

    console.info('verifyJWT: Executed Successfully.');
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error occurred during token verification:', error?.message);
    throw new ErrorResponse(401, error?.message || 'Invalid access token', [error?.message]);
  }

});

export { verifyJWT };
