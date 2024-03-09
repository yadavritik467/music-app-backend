import Song from "../model/songs.js";
import User from "../model/user.js";
import { removeVisitedUserById } from "../utils/utils.js";
import fs from 'fs'


// for register user
export const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword } = req.body;

        // for ensuring the email type
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) res.status(500).json({ message: 'Invalid email format' });
        else if (password.length < 6) return res.status(500).json({ message: "password length should be minimum six" });
        else if (password !== confirmPassword) return res.status(500).json({ message: "password mismatch" });
        else if (!firstName || !lastName) return res.status(500).json({ message: "First and Last name is required " });
        else {
            const existingUser = await User.findOne({ email })
            if (existingUser) res.status(200).json({ message: "User already exists", existingUser });
            else {
                const user = await User.create({ firstName, lastName, email, password });
                return res.status(200).json({ message: "User registered successfully", user });
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// for login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(404).json({ message: "Invalid email or password" });
        }
        else if (!password) {
            return res.status(404).json({ message: "Please enter your password" });
        }
        else {
            const validatePassword = await user.matchPassword(password);
            if (!validatePassword) {
                return res.status(404).json({ message: "Invalid email or password" });
            } else {
                const token = await user.generateToken();
                return res.status(200)
                    .json({
                        message: "login succesfully",
                        user,
                        token
                    })
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const uploadProfilePicture = async (req, res) => {
    try {
        const profilePicture = req.file
        const user = await User.findById(req.user._id)
        if (user.profilePicture) {
            fs.unlinkSync(`./${user.profilePicture}`)
            user.profilePicture = null
            user.profilePicture = profilePicture.path
            await user.save()
            return res.status(200).json({ message: 'Profile picture updated successfully' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (user.profilePicture) {
            fs.unlinkSync(`./${user.profilePicture}`)
            user.profilePicture = null
            await user.save()
            return res.status(200).json({ message: 'Profile picture deleted successfully' });
        } else {
            return res.status(200).json({ message: 'No Profile picture exists !!' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const updateMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const { firstName, lastName, email } = req.body
        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName
        if (email) user.email = email
        await user.save()
        return res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const preferSongs = async (req, res) => {
    try {
        const { preferSongs } = req.body
        const user = await User.findById(req.user._id)
        user.preferSongs = preferSongs
        await user.save()
        return res.status(200).json({ user })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const uploadSongs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const { albumName } = req.body;
        const albumImage = req.files.file[0]

        const existingAlbumName = user.albumCreation.find(album => album.albumName === albumName)
        if (existingAlbumName) {
            return res.status(401).json({ message: 'This album name is already exists' });
        } else {
            let uploadedSongsId = []
            await Promise.all(req?.files?.songs?.map(async (song) => {
                const newSong = await Song.create({
                    songName: song.originalname,
                    songs: song.path
                })
                uploadedSongsId.push(newSong._id)
                return newSong
            }))
            user.albumCreation.push({
                albumImage: albumImage.path,
                albumName: albumName,
                uploadedSongs: uploadedSongsId,
            });
            await user.save()
            return res.status(200).json({ message: 'Songs uploaded and data saved successfully', user });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const followUnFollowUser = async (req, res) => {
    try {
        const me = await User.findById(req.user._id)
        const followToUser = await User.findById(req.params.id)
        if (!followToUser) {
            res.status(401).json({ message: 'User not exists', followToUser });
        } else {
            const myFollowingList = me.following.includes(followToUser._id)
            const userFollowerList = followToUser.follower.includes(me._id)
            if (!myFollowingList && !userFollowerList) {
                me.following.push(followToUser._id)
                followToUser.follower.push(me._id)
                me.save()
                followToUser.save()
                return res.status(200).json({ message: 'Followed Successfully' });
            } else {
                me.following.pull(followToUser._id);
                followToUser.follower.pull(me._id);
                await me.save();
                await followToUser.save();
                return res.status(200).json({ message: 'Unfollowed Successfully' });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const showUserDetailsOfUser = async (req, res) => {
    try {
        const allDetails = await User.findById(req.params.id)
            .populate({
                path: 'follower',
                select: 'firstName lastName email profilePicture'
            })
            .populate({
                path: 'following',
                select: 'firstName lastName email profilePicture'
            })
            .populate({
                path: 'visited',
                select: 'firstName lastName email profilePicture'
            })
            .populate({
                path: 'albumCreation',
                populate: {
                    path: 'uploadedSongs',
                    select: 'songName songs'
                }
            });

        if (!allDetails.visited.includes(req.user._id)) {
            const expiryTime = Date.now() + 24 * 60 * 60 * 1000;
            allDetails.visited.push(req.user._id);
            await allDetails.save()
            setTimeout(() => {
                removeVisitedUserById(req.params.id, req.user._id);
            }, expiryTime - Date.now());
        }

        return res.status(200).json({ message: 'User details fetched successfully', allDetails });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllUser = async (req, res) => {
    try {
        const { page = 1, limit = 2, search } = req.query
        const condition = search
            ? {
                $or: [
                    { email: { $regex: new RegExp(search, 'i') } },
                    { firstName: { $regex: new RegExp(search, 'i') } },
                    { lastName: { $regex: new RegExp(search, 'i') } },
                ],
            }
            : {};
        const allUser = await User.find(condition, { firstName:1,lastName:1,email: 1, profilePicture: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        return res.status(200).json({ message: 'All user fetched successfully', allUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getAllSongs = async (req, res) => {
    try {
        const { page = 1, limit = 2, search } = req.query
        const condition = search ? { songName: { $regex: new RegExp(search, 'i') } } : {}
        const allSongs = await Song.find(condition, { songName: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        return res.status(200).json({ message: 'All songs fetched successfully', allSongs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}