import { asyncHandler } from '../utils/asyncHandler.js';
import { ErrorResponse } from '../utils/ErrorResponse.js';
import { SuccessResponse } from '../utils/SuccessResponse.js';
import { User } from '../models/user.models.js';
import { Data } from '../models/data.models.js';
import { options } from '../constants.js';
import jwt from 'jsonwebtoken';

const generateAccessAndRefreshToken = async (userId) => {
  console.info('generateAccessAndRefreshToken: Started.');

  try {
    const user = await User.findById(userId);

    // Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    // Save the refresh token in the database
    await user.save({ validateBeforeSave: false });

    console.info('generateAccessAndRefreshToken: Executed successfully.');
    return { accessToken, refreshToken };
  } catch (error) {
    console.error('generateAccessAndRefreshToken error:', error);
    throw new ErrorResponse(500, 'Error generating access and refresh tokens.', [error?.message]);
  }
}

const registerUser = asyncHandler(async (req, res, next) => {
  console.info('registerUser: Started.');

  const { userName = '', email = '', password = '', initialPrompt = '' } = req?.body || {};

  // Validation
  if (![userName, email, password, initialPrompt].every((field) => field?.trim())) {
    console.error('registerUser error: Required data is not provided.');
    throw new ErrorResponse(400, 'Please provide all the required fields.');
  }

  // Check if user already exists
  const user = await User.findOne({
    $or: [
      { userName: userName.trim().toLowerCase() },
      { email: email.trim().toLowerCase() },
    ]
  });

  if (user) {
    console.error('registerUser error: User with same userName or email already exists.');
    throw new ErrorResponse(400, '\'userName\' or \'email\' already exists. Please try again with different values.');
  }

  let txtData = undefined;
  if (req?.file?.buffer) {
    // Check if the uploaded file is a PDF
    const fileType = req?.file?.mimetype;
    if (fileType !== 'text/plain') {
      console.error('registerUser error: Upload only .txt file not other files.');
      throw new ErrorResponse(400, 'Please upload a valid text(\'.txt\') file.');
    }

    // Extract text from the txtFile
    try {
      txtData = req?.file?.buffer?.toString();
    } catch (error) {
      console.error('registerUser error: Error extracting text from the uploaded txtFile.');
      throw new ErrorResponse(500, 'Error extracting text from the uploaded txtFile.', [error?.message]);
    }
  }

  const createdUser = await User.create({
    userName: userName.trim().toLowerCase(),
    email: email.trim().toLowerCase(),
    password: password.trim(),
  });

  await Data.create({
    userName: userName.trim().toLowerCase(),
    initialPrompt,
    txtData,
  });

  const userObj = await User.findById(createdUser._id).select('-password -refreshToken -__v');

  if (!userObj) {
    console.error('registerUser error: User not found.');
    throw new ErrorResponse(404, 'User not found.');
  }

  console.info('registerUser: Executed successfully.');
  return res.status(200).json(
    new SuccessResponse(200, userObj, 'User created successfully.')
  );
});

const loginUser = asyncHandler(async (req, res, next) => {
  console.info('loginUser: Started.');

  const { userName = '', email = '', password = '' } = req?.body || {};

  // Validation
  const userOrEmailPresent = [userName, email].some((field) => field?.trim());
  if (!userOrEmailPresent || !password?.trim()) {
    console.error('loginUser error: Provide userName or email and password to login.');
    throw new ErrorResponse(400, 'Please provide (\'userName\' or \'email\') and (\'password\') to login.');
  }

  // Check if user exists
  const user = await User.findOne({
    $or: [
      { userName: userName.trim().toLowerCase() },
      { userName: email.trim().toLowerCase() }, // Allow when userName is provided in email field
      { email: email.trim().toLowerCase() },
      { email: userName.trim().toLowerCase() }, // Allow when email is provided in userName field
    ]
  }).select('+password');

  if (!user) {
    console.error('loginUser error: User not found.');
    throw new ErrorResponse(400, 'No user found. Please try again with correct \'userName\' or \'email\'.');
  }

  // Check if password is correct
  const validPassword = await user.comparePassword(password?.trim());

  if (!validPassword) {
    console.error('loginUser error: Invalid credentials.');
    throw new ErrorResponse(401, 'Invalid credentials. Please try again.');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select('-password -refreshToken -__v');
  if (!loggedInUser) {
    console.error('loginUser error: User not found when validated with ID.');
    throw new ErrorResponse(404, 'User not found.');
  }

  console.info('loginUser: Executed successfully.');
  // Set the access and refresh token in the cookie
  return res
    .status(200)
    .cookie('refreshToken', refreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new SuccessResponse(
      200,
      { user: loggedInUser, accessToken, refreshToken },
      'User logged in successfully.'
    ));
});

const renewAccessToken = asyncHandler(async (req, res, next) => {
  console.info('renewAccessToken: Started.');

  const incomingRefreshToken = req?.cookies?.refreshToken || req?.body?.refreshToken;

  if (!incomingRefreshToken) {
    console.error('renewAccessToken error: No refresh token found.');
    throw new ErrorResponse(401, 'No refresh token found. Please login again.');
  }

  // Verify the refresh token
  const user = await User.findOne({ refreshToken: incomingRefreshToken });
  if (!user) {
    console.error('renewAccessToken error: Invalid refresh token.');
    throw new ErrorResponse(401, 'Invalid refresh token. Please login again.');
  }

  // Verifying JWT
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Check if the refresh token is tampered
    if (decodedToken?._id?.toString() !== user?._id?.toString()) {
      console.error('renewAccessToken error: Refresh token is tampered.');
      throw new ErrorResponse(401, 'Refresh token is tampered. Please login again.');
    }

    // Check if the refresh token is expired
    if (decodedToken?.exp < Date.now() / 1000) {
      console.error('renewAccessToken error: Refresh token is expired.');
      throw new ErrorResponse(401, 'Refresh token is expired. Please login again.');
    }
  } catch (error) {
    console.error('renewAccessToken error:', error);
    throw new ErrorResponse(401, 'Refresh token is invalid. Please login again.', [error?.message]);
  }

  // Generate a new access token
  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id);

  console.info('renewAccessToken: Executed successfully.');
  // Set the access and refresh token in the cookie
  return res
    .status(200)
    .cookie('refreshToken', newRefreshToken, options)
    .cookie('accessToken', accessToken, options)
    .json(new SuccessResponse(
      200,
      { accessToken, refreshToken: newRefreshToken },
      'Refresh token renewed successfully.'
    ));
});

const editUser = asyncHandler(async (req, res, next) => {
  console.info('editUser: Started.');

  const { email = '', oldPassword = '', newPassword = '', initialPrompt = '' } = req?.body || {};

  // Validation
  if (![email, newPassword, initialPrompt, req?.file?.toString()].some((field) => field?.trim())) {
    console.error('editUser error: Required fields not provided.');
    throw new ErrorResponse(400, 'Please provide atleast one valid field to update.');
  }

  // Check if user exists
  const user = await User.findById(req?.user?._id);
  if (!user) {
    console.error('editUser error: User not found.');
    throw new ErrorResponse(404, 'User not found.');
  }

  // Check if data object exists
  const data = await Data.findOne({ userName: user.userName });
  if (!data) {
    console.error('editUser error: Data object not found to update.');
    throw new ErrorResponse(404, 'Data object not found to update.');
  }

  // Update user details
  if (email?.trim())
    user.email = email.trim().toLowerCase();

  if (newPassword?.trim()) {
    // Check if old password is provided
    if (!oldPassword?.trim()) {
      console.error('editUser error: oldPassword not provided.');
      throw new ErrorResponse(400, 'Please provide the \'oldPassword\' to update the new password.');
    }

    // Check if old password is correct
    const validPassword = await user.comparePassword(oldPassword);
    if (!validPassword) {
      console.error('editUser error: Incorrect oldPassword.');
      throw new ErrorResponse(401, 'Incorrect \'oldPassword\'. Please try again.');
    }

    user.password = newPassword.toLowerCase();
  }

  if (initialPrompt?.trim())
    data.initialPrompt = initialPrompt.trim();

  if (req?.file?.buffer) {
    // Check if the uploaded file is a PDF
    const fileType = req?.file?.mimetype;
    if (fileType !== 'text/plain') {
      console.error('editUser error: Upload only .txt file not other files.');
      throw new ErrorResponse(400, 'Please upload a valid text(\'.txt\') file.');
    }

    // Extract text from the txtFile
    try {
      data.txtData = req.file.buffer.toString();
    } catch (error) {
      console.error('editUser error:', error);
      throw new ErrorResponse(500, 'Error extracting text from the uploaded txtFile.', [error?.message]);
    }
  }

  // Saving the provided data
  await user.save();
  await data.save();

  // Deleting sensitive
  delete user.refreshToken;
  delete user.password;
  delete user.__v;
  delete data.__v;
  delete data.userName;

  // Showing only 51 characters of txtData
  data.txtData = data.txtData?.substring(0, 51) + '...';

  console.info('editUser: Executed successfully.');
  // Returning success response
  return res.status(200).json(
    new SuccessResponse(200, {
      user, data
    }, 'User and data updated successfully.')
  );
});

const deleteUser = asyncHandler(async (req, res, next) => {
  console.info('deleteUser: Started.');

  // Check if user exists and delete
  const user = await User.findByIdAndDelete(req?.user?._id);
  if (!user) {
    console.error('deleteUser error: User not found to delete.');
    throw new ErrorResponse(404, 'User not found to delete.');
  }

  // Check if data object exists and delete
  const data = await Data.findOneAndDelete({ userName: user.userName });
  if (!data) {
    console.error('deleteUser error: Data object not found to delete.');
    throw new ErrorResponse(404, 'Data object not found to delete.');
  }

  console.info('deleteUser: Executed successfully.');
  return res.status(200).json(
    new SuccessResponse(200, null, 'User and data deleted successfully.')
  );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  console.info('logoutUser: Started.');

  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: {
        refreshToken: undefined,
      }
    },
    { new: true },
  );

  console.info('logoutUser: Executed successfully.');
  return res
    .status(200)
    .clearCookie('refreshToken', options)
    .clearCookie('accessToken', options)
    .json(new SuccessResponse(
      200,
      null,
      'User logged out successfully.'
    ));
});

export {
  registerUser,
  loginUser,
  renewAccessToken,
  editUser,
  deleteUser,
  logoutUser,
};
