import express from 'express';
import { registerUser, loginUser, myProfile, preferSongs, uploadSongs, followUnFollowUser, showUserDetailsOfUser, getAllUser, getAllSongs, uploadProfilePicture, deleteProfilePicture, updateMyProfile } from '../controller/user.js';
import { requireSignIn } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploadsImage');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});



const upload = multer({
    storage
});

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/uploadSongs', requireSignIn, upload.fields([{ name: 'file' }, { name: 'songs' }]), uploadSongs)
router.post('/preferSongs', requireSignIn, preferSongs)
router.post('/uploadProfilePicture', requireSignIn, upload.single('file'), uploadProfilePicture)
// follow/unFollow user
router.post('/followUnFollow/:id', requireSignIn, followUnFollowUser)

router.get('/me', requireSignIn, myProfile)
router.get('/user-details/:id', requireSignIn, showUserDetailsOfUser)
router.get('/all-users', requireSignIn, getAllUser)
router.get('/all-songs', requireSignIn, getAllSongs)

router.put('/updateMyProfile', requireSignIn, updateMyProfile)

router.delete('/deleteProfilePicture', requireSignIn, deleteProfilePicture)

export default router;