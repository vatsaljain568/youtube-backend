import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"]
    },

    description: {
        type: String,
        required: [true, "description is required"],
        maxLength: 500
    },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    videos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }]

}, { timestamps: true });

export const Playlist = mongoose.model("Playlist", playlistSchema);