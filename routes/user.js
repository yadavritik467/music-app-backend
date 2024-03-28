import express from 'express';
import { registerUser, loginUser, myProfile, uploadSongs, followUnFollowUser, showUserDetailsOfUser, getAllUser, getAllSongs, uploadProfilePicture, deleteProfilePicture, updateMyProfile, listenSongs, deleteMyProfile } from '../controller/user.js';
import { requireSignIn } from '../middleware/authMiddleware.js';


const router = express.Router();


// for users
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/uploadSongs', requireSignIn, uploadSongs)
router.post('/preferSongs', requireSignIn)
router.post('/uploadProfilePicture', requireSignIn, uploadProfilePicture)
// follow/unFollow user
router.post('/followUnFollow/:id', requireSignIn, followUnFollowUser)

router.get('/me', requireSignIn, myProfile)
router.get('/user-details/:id', requireSignIn, showUserDetailsOfUser)
router.get('/all-users', requireSignIn, getAllUser)
router.get('/all-songs', requireSignIn, getAllSongs)

router.put('/updateMyProfile', requireSignIn, updateMyProfile)

router.delete('/deleteProfilePicture', requireSignIn, deleteProfilePicture)
router.delete('/deleteMyProfile/:id', requireSignIn, deleteMyProfile)


// for songs 
router.get('/listenSong/:id', requireSignIn, listenSongs)

export default router;