import mongoose, { model, models, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { Comment } from "./Comment";
import { User } from "./User";

export const VIDEO_DIMENSIONS = {
    width: 1920,
    height: 1080
}as const

export const IMAGE_DIMENSION = {
    width: 1920,
    height: 1080
}as const

export type MediaType = "video" | "image"

export interface Post{
    _id?: mongoose.Types.ObjectId,
    title: string,
    description: string,
    mediaUrl: string,
    thumbnailUrl?: string,
    controls?: boolean
    type: MediaType,
    transformationVideo?: {
        height: number,
        width: number,
        quality?: number
    },
    transformationImage?:{
        height: number,
        width: number,
        quality?: number
    }
    likecount?: number,
    comments: Comment[],
    userPosted?: string,
    imagekitFileId: string,
    flagged: boolean,
    createdAt?: Date,
    updatedAt?: Date,
    
}

const PostsSchema = new Schema<Post>(
    {
        title: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
            required: true,
            unique: true
        },
        mediaUrl: {
            type: String,
            unique: true,
            required: true
        },
        thumbnailUrl: {
            type: String,
            unique: true,
            required: false
        },
        controls: {
            type: Boolean,
            unique: false,
            default: true
        },
        type: { type: String, enum: ["video", "image"], required: true },
        transformationVideo: {
            height: {type: Number, default: VIDEO_DIMENSIONS.height},
            width: {type: Number, default :VIDEO_DIMENSIONS.width},
            quality: {type: Number, min: 1, max :1440}
        },
        transformationImage: {
            height: {type: Number, default: IMAGE_DIMENSION.height},
            width: {type: Number, default :IMAGE_DIMENSION.width},
            quality: {type: Number, min: 1, max :1440}
        },
        likecount: {
            type: Number,
            required: true,
            default: 0
        },
        flagged: {
            type: Boolean,
            required: true,
            default: false
        },
        comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
        userPosted: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        imagekitFileId: {
            type: String,
            required: true,
        },
    },
    {timestamps: true}
);



const Posts = models?.Posts || model<Post>("Posts", PostsSchema);

export default Posts;
