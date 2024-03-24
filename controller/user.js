import Song from "../model/songs.js";
import User from "../model/user.js";
import cloudinary from "cloudinary";
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
        const profilePicture = req.body.file

        const user = await User.findById(req.user._id)

        if (user.profilePicture.public_id && user.profilePicture.url) {
            await cloudinary.v2.uploader.destroy(user.profilePicture.public_id)
            user.profilePicture.public_id = null
            user.profilePicture.url = null
        }
        const myCloud = await cloudinary.v2.uploader.upload(profilePicture, {
            folder: "music-image",
            resource_type: "auto",
        })
        user.profilePicture.public_id = myCloud.public_id
        user.profilePicture.url = myCloud.url

        await user.save()
        return res.status(200).json({ message: 'Profile picture updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

export const deleteProfilePicture = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        if (user.profilePicture.public_id && user.profilePicture.url) {
            await cloudinary.v2.uploader.destroy(user.profilePicture.public_id)
            user.profilePicture.public_id = null
            user.profilePicture.url = null
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
        return res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const uploadSongs = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        const { albumName, file, song } = req.body;
        console.log(song)

        const existingAlbumName = user.albumCreation.find(album => album.albumName === albumName)
        if (existingAlbumName) {
            return res.status(401).json({ message: 'This album name is already exists' });
        } else {
            const myCloudArray = []
            const myCloud = await cloudinary.v2.uploader.upload(file, {
                folder: "music-image",
                resource_type: "auto",
            })

            for (const songs of song) {
                try {
                    const myCloud_2 = await cloudinary.v2.uploader.upload(song[songs], {
                        folder: "songs",
                        resource_type: "auto",
                    });
                    myCloudArray.push(myCloud_2);
                    return myCloudArray
                } catch (error) {
                    console.error("Error uploading file to Cloudinary:", error);
                    // Handle error if needed
                }
            }

            // console.log(myCloudArray)
            let uploadedSongsId = []
            await Promise.all(req?.body?.song?.map(async (songs) => {
                // const myCloud_2 = await cloudinary.v2.uploader.upload(songs, {
                //     folder: "songs",
                // });
                // console.log(myCloud_2)
                // const newSong = await Song.create({
                //     songName: song.originalname,
                //     songs: song.path
                // })
                // uploadedSongsId.push(newSong._id)
                // return newSong
            }))
            // user.albumCreation.push({
            //     albumImage: {
            //         public_id: albumImage?.myCloud?.public_id,
            //         url: albumImage?.myCloud?.url
            //     },
            //     albumName: albumName,
            //     uploadedSongs: uploadedSongsId,
            // });
            // await user.save()
            return res.status(200).json({ message: 'Songs uploaded and data saved successfully', user });
        }
    } catch (error) {
        console.log(error)
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
                    select: 'songName songs listeningCount'
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
        const { page = 1, limit = 5, search } = req.query
        const condition = search
            ? {
                $and: [
                    {
                        $or: [
                            { email: { $regex: new RegExp(search, 'i') } },
                            { firstName: { $regex: new RegExp(search, 'i') } },
                            { lastName: { $regex: new RegExp(search, 'i') } },
                        ],
                    },
                    { _id: { $ne: req.user._id } }
                ]
            }
            : { _id: { $ne: req.user._id } };
        const allUser = await User.find(condition, { firstName: 1, lastName: 1, email: 1, profilePicture: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        return res.status(200).json({ message: 'All user fetched successfully', allUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// for songs

export const getAllSongs = async (req, res) => {
    try {
        const { page = 1, limit = 5, search } = req.query
        const condition = search ? { songName: { $regex: new RegExp(search, 'i') } } : {}
        const allSongs = await Song.find(condition, { songName: 1 }).sort()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        return res.status(200).json({ message: 'All songs fetched successfully', allSongs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const listenSongs = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id)
        if (!song.listeningCount.includes(req.user._id)) {
            song.listeningCount.push(req.user._id)
        }
        await song.save()
        return res.status(200).json({ message: 'Single song fetch', song })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}