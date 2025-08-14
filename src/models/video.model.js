import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
            lowercase: true
        },

        duration: {
            type: Number, // cloudinary url
            required: true
        },

        views: {
            type: Number,
            default: 0,
            required: true
        },

        isPublished: {
            type: Boolean,
            required: true
        },

        thumbnail: {
            type: String, // cloudinary url
            required: true
        },

        videoFile:{
            type: String, // cloudinary url
            required: true
        },

        owner:{
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
        }
    },
    { timestamps: true }
);

videoSchema.plugin(mongooseAggregatePaginate);
// This plugin allows us to use aggregate pagination on the video model

export const Video = mongoose.model("Video", videoSchema);