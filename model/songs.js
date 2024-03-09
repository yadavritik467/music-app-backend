import mongoose from 'mongoose';


const songsSchema = new mongoose.Schema({
    songName: {
        type: String,
    },
   songs:{
    type:String
   }
})


const Song = mongoose.model("Song", songsSchema);

export default Song;