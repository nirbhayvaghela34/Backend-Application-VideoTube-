import mongoose, {Schema} from "mongoose";

const playListSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ]    
},{timestamps: true});

export const Playlist = mongoose.model("PlayList", playListSchema)