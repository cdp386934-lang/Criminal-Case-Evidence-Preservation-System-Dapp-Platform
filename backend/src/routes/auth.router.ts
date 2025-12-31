import { Router } from 'express';
import { loginUser, registerUser } from '../controllers/auth.controller';
import { avatarUpload } from '../utils/avatar-upload';

const router = Router();

router.post('/register', avatarUpload.single('avatar'), registerUser);
router.post('/login', loginUser);

export default router;


