import { Router } from 'express';
import { upload } from '../middlewares/multer.middlewares.js';
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import {
  registerUser,
  loginUser,
  renewAccessToken,
  editUser,
  deleteUser,
  logoutUser
} from '../controllers/user.controllers.js';

const router = Router();

// Public Routes
router.route('/register').post(
  upload.single('txtFile'),
  registerUser
);
router.route('/login').post(loginUser);
router.route('/renewAccessToken').post(renewAccessToken);
router.route('/logout').post(logoutUser);

// Secure Routes
router.route('/edit').put(
  upload.single('txtFile'), verifyJWT, editUser
);
router.route('/delete').delete(verifyJWT, deleteUser);

export default router;
