// models/Like.ts
import mongoose, { Schema, Document, models } from "mongoose";

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  postId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate likes from the same user on the same post
LikeSchema.index({ userId: 1, postId: 1 }, { unique: true });

export default models.Like || mongoose.model<ILike>("Like", LikeSchema);
