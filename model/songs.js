import mongoose from 'mongoose';


const songsSchema = new mongoose.Schema({
    songName: {
        type: String,
    },
    songs: {
        public_id: {
            type: String,
            default: null
        },
        url: {
            type: String,
            default: null
        }
    },
    listeningCount: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }
})


const Song = mongoose.model("Song", songsSchema);

export default Song;