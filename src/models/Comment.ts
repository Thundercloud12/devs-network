import mongoose, { model, models, Schema } from "mongoose";




export interface Comment{
    _id?: mongoose.Types.ObjectId,
    content: string,
    likecount: number,
    userPosted: string,
    createdAt?: Date,
    updatedAt?: Date,
}

const CommentSchema = new Schema<Comment>(
    {
        content: {
            type: String,
            required: true,
            unique: false
        },
        likecount: {
            type: Number,
            required: true,
            default: 0
        },
        userPosted: { type: String, required: true },
    },
    {timestamps: true}
);



const Comment = models?.Comment || model<Comment>("Comment", CommentSchema);

export default Comment;
